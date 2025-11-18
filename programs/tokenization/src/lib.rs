use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("TokenizationProgram11111111111111111111111");

#[program]
pub mod meteora_tokenization {
    use super::*;

    // ============ TOKENIZATION ENGINE ============

    /// Create a new RWA vault with tokenized cash flows
    pub fn create_vault(
        ctx: Context<CreateVault>,
        principal: u64,
        total_expected_interest: u64,
        monthly_payment: u64,
        total_months: u32,
        vault_name: String,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.token_mint = ctx.accounts.token_mint.key();
        vault.vault_treasury = ctx.accounts.vault_treasury.key();
        vault.principal = principal;
        vault.total_expected_interest = total_expected_interest;
        vault.monthly_payment = monthly_payment;
        vault.total_months = total_months;
        vault.current_month = 0;
        vault.total_tokens_minted = principal.checked_add(total_expected_interest).ok_or(MeteraError::ArithmeticOverflow)?;
        vault.vault_name = vault_name;
        vault.created_at = Clock::get()?.unix_timestamp;
        vault.total_redeemed = 0;
        vault.is_active = true;

        emit!(VaultCreated {
            vault: vault.key(),
            principal,
            total_expected_interest,
            total_tokens_minted: vault.total_tokens_minted,
            monthly_payment,
            total_months,
        });

        Ok(())
    }

    /// Mint tokens representing cash flow claims
    pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        let vault = &ctx.accounts.vault;

        require!(vault.is_active, MeteraError::VaultInactive);
        require!(amount <= vault.total_tokens_minted, MeteraError::ExceedsTokenSupply);

        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            amount,
        )?;

        emit!(TokensMinted {
            vault: vault.key(),
            amount,
            recipient: ctx.accounts.destination.key(),
        });

        Ok(())
    }

    // ============ DISTRIBUTION & PRIMARY MARKET ============

    /// Purchase tokens at primary market discount
    pub fn purchase_tokens_primary(
        ctx: Context<PurchaseTokensPrimary>,
        token_amount: u64,
        discount_percentage: u8,
    ) -> Result<()> {
        require!(discount_percentage <= 100, MeteraError::InvalidDiscount);

        let vault = &ctx.accounts.vault;
        require!(vault.is_active, MeteraError::VaultInactive);

        // Calculate purchase price with discount
        let par_value = token_amount;
        let discount_amount = (par_value as u128)
            .checked_mul(discount_percentage as u128)
            .ok_or(MeteraError::ArithmeticOverflow)?
            .checked_div(100)
            .ok_or(MeteraError::ArithmeticOverflow)? as u64;

        let purchase_price = par_value.checked_sub(discount_amount).ok_or(MeteraError::ArithmeticOverflow)?;

        // Transfer payment from buyer to vault treasury
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.buyer_payment_account.to_account_info(),
                    to: ctx.accounts.vault_treasury.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            purchase_price,
        )?;

        // Mint tokens to buyer
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            token_amount,
        )?;

        // Record purchase
        let primary_sale = &mut ctx.accounts.primary_sale;
        primary_sale.vault = vault.key();
        primary_sale.buyer = ctx.accounts.buyer.key();
        primary_sale.token_amount = token_amount;
        primary_sale.purchase_price = purchase_price;
        primary_sale.discount_percentage = discount_percentage;
        primary_sale.purchased_at = Clock::get()?.unix_timestamp;

        emit!(TokensPurchased {
            vault: vault.key(),
            buyer: ctx.accounts.buyer.key(),
            token_amount,
            purchase_price,
            discount_percentage,
        });

        Ok(())
    }

    // ============ MONTHLY REPAYMENT CYCLE ============

    /// Receive monthly payment into the vault
    pub fn receive_monthly_payment(ctx: Context<ReceiveMonthlyPayment>, payment_amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.is_active, MeteraError::VaultInactive);
        require!(vault.current_month < vault.total_months, MeteraError::VaultMatured);

        // Verify payment matches expected monthly payment
        require!(payment_amount == vault.monthly_payment, MeteraError::InvalidPaymentAmount);

        // Transfer payment to vault treasury
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.payer_account.to_account_info(),
                    to: ctx.accounts.vault_treasury.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            payment_amount,
        )?;

        // Record payment
        let payment = &mut ctx.accounts.monthly_payment_record;
        payment.vault = vault.key();
        payment.month = vault.current_month;
        payment.amount = payment_amount;
        payment.received_at = Clock::get()?.unix_timestamp;
        payment.available_for_redemption = payment_amount;

        vault.current_month = vault.current_month.checked_add(1).ok_or(MeteraError::ArithmeticOverflow)?;

        emit!(MonthlyPaymentReceived {
            vault: vault.key(),
            month: payment.month,
            amount: payment_amount,
        });

        Ok(())
    }

    /// Redeem tokens for cash flow (first-come, first-served)
    pub fn redeem_tokens(
        ctx: Context<RedeemTokens>,
        token_amount: u64,
    ) -> Result<()> {
        let vault = &ctx.accounts.vault;
        require!(vault.is_active, MeteraError::VaultInactive);

        // Get current month's available redemption capacity
        let monthly_payment_record = &mut ctx.accounts.monthly_payment_record;
        require!(monthly_payment_record.available_for_redemption >= token_amount, MeteraError::InsufficientRedemptionCapacity);

        // Verify user has enough tokens
        let user_token_account = &ctx.accounts.user_token_account;
        require!(user_token_account.amount >= token_amount, MeteraError::InsufficientTokenBalance);

        // Burn tokens from user
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Burn {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    from: user_token_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            token_amount,
        )?;

        // Transfer redemption value from vault treasury to user
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.vault_treasury.to_account_info(),
                    to: ctx.accounts.user_payment_account.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                },
            ),
            token_amount,
        )?;

        // Update redemption records
        monthly_payment_record.available_for_redemption = monthly_payment_record.available_for_redemption
            .checked_sub(token_amount)
            .ok_or(MeteraError::ArithmeticOverflow)?;

        let vault_mut = &mut ctx.accounts.vault_mut;
        vault_mut.total_redeemed = vault_mut.total_redeemed
            .checked_add(token_amount)
            .ok_or(MeteraError::ArithmeticOverflow)?;

        // Record redemption
        let redemption = &mut ctx.accounts.redemption_record;
        redemption.vault = vault.key();
        redemption.redeemer = ctx.accounts.user.key();
        redemption.token_amount = token_amount;
        redemption.redemption_value = token_amount;
        redemption.redeemed_at = Clock::get()?.unix_timestamp;
        redemption.month = monthly_payment_record.month;

        emit!(TokensRedeemed {
            vault: vault.key(),
            redeemer: ctx.accounts.user.key(),
            token_amount,
            redemption_value: token_amount,
            month: monthly_payment_record.month,
        });

        Ok(())
    }

    // ============ LIQUIDITY PROVISION MODULE ============

    /// Create a liquidity pool for secondary market
    pub fn create_liquidity_pool(
        ctx: Context<CreateLiquidityPool>,
        pool_name: String,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.liquidity_pool;
        pool.vault = ctx.accounts.vault.key();
        pool.token_a_mint = ctx.accounts.token_a_mint.key();
        pool.token_b_mint = ctx.accounts.token_b_mint.key();
        pool.pool_authority = ctx.accounts.authority.key();
        pool.pool_name = pool_name;
        pool.created_at = Clock::get()?.unix_timestamp;
        pool.token_a_reserve = 0;
        pool.token_b_reserve = 0;
        pool.total_lp_shares = 0;
        pool.window_start = Clock::get()?.unix_timestamp;
        pool.window_number = 0;
        pool.is_active = true;

        emit!(LiquidityPoolCreated {
            pool: pool.key(),
            vault: ctx.accounts.vault.key(),
            token_a: ctx.accounts.token_a_mint.key(),
            token_b: ctx.accounts.token_b_mint.key(),
            pool_name: pool.pool_name.clone(),
        });

        Ok(())
    }

    /// Provide liquidity to the pool
    pub fn provide_liquidity(
        ctx: Context<ProvideLiquidity>,
        token_a_amount: u64,
        token_b_amount: u64,
        forward_discount_percentage: u8,
    ) -> Result<()> {
        require!(forward_discount_percentage <= 100, MeteraError::InvalidDiscount);

        let pool = &mut ctx.accounts.liquidity_pool;
        require!(pool.is_active, MeteraError::PoolInactive);

        // Check if 3-month window needs reset
        let current_time = Clock::get()?.unix_timestamp;
        let window_duration = 90 * 24 * 60 * 60; // 3 months in seconds
        if current_time.checked_sub(pool.window_start).ok_or(MeteraError::ArithmeticOverflow)? > window_duration {
            pool.window_start = current_time;
            pool.window_number = pool.window_number.checked_add(1).ok_or(MeteraError::ArithmeticOverflow)?;
        }

        // Transfer tokens from LP to pool
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.lp_token_a_account.to_account_info(),
                    to: ctx.accounts.pool_token_a_vault.to_account_info(),
                    authority: ctx.accounts.lp.to_account_info(),
                },
            ),
            token_a_amount,
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.lp_token_b_account.to_account_info(),
                    to: ctx.accounts.pool_token_b_vault.to_account_info(),
                    authority: ctx.accounts.lp.to_account_info(),
                },
            ),
            token_b_amount,
        )?;

        // Calculate and mint LP shares
        let lp_shares = if pool.total_lp_shares == 0 {
            // Initial liquidity
            (token_a_amount as u128)
                .checked_mul(token_b_amount as u128)
                .ok_or(MeteraError::ArithmeticOverflow)?
                .isqrt() as u64
        } else {
            // Proportional shares
            let a_ratio = (token_a_amount as u128)
                .checked_mul(pool.total_lp_shares as u128)
                .ok_or(MeteraError::ArithmeticOverflow)?
                .checked_div(pool.token_a_reserve as u128)
                .ok_or(MeteraError::ArithmeticOverflow)? as u64;

            let b_ratio = (token_b_amount as u128)
                .checked_mul(pool.total_lp_shares as u128)
                .ok_or(MeteraError::ArithmeticOverflow)?
                .checked_div(pool.token_b_reserve as u128)
                .ok_or(MeteraError::ArithmeticOverflow)? as u64;

            a_ratio.min(b_ratio)
        };

        pool.token_a_reserve = pool.token_a_reserve.checked_add(token_a_amount).ok_or(MeteraError::ArithmeticOverflow)?;
        pool.token_b_reserve = pool.token_b_reserve.checked_add(token_b_amount).ok_or(MeteraError::ArithmeticOverflow)?;
        pool.total_lp_shares = pool.total_lp_shares.checked_add(lp_shares).ok_or(MeteraError::ArithmeticOverflow)?;

        // Record LP position
        let lp_position = &mut ctx.accounts.lp_position;
        lp_position.pool = pool.key();
        lp_position.lp = ctx.accounts.lp.key();
        lp_position.token_a_amount = token_a_amount;
        lp_position.token_b_amount = token_b_amount;
        lp_position.lp_shares = lp_shares;
        lp_position.forward_discount_percentage = forward_discount_percentage;
        lp_position.window_number = pool.window_number;
        lp_position.provided_at = current_time;

        emit!(LiquidityProvided {
            pool: pool.key(),
            lp: ctx.accounts.lp.key(),
            token_a_amount,
            token_b_amount,
            lp_shares,
            forward_discount_percentage,
        });

        Ok(())
    }

    /// Withdraw liquidity from the pool
    pub fn withdraw_liquidity(ctx: Context<WithdrawLiquidity>, lp_shares: u64) -> Result<()> {
        let pool = &mut ctx.accounts.liquidity_pool;
        require!(pool.is_active, MeteraError::PoolInactive);
        require!(pool.total_lp_shares > 0, MeteraError::ZeroLiquidityPool);

        let lp_position = &mut ctx.accounts.lp_position;
        require!(lp_position.lp_shares >= lp_shares, MeteraError::InsufficientLPShares);

        // Calculate proportional amounts to withdraw
        let token_a_amount = (lp_shares as u128)
            .checked_mul(pool.token_a_reserve as u128)
            .ok_or(MeteraError::ArithmeticOverflow)?
            .checked_div(pool.total_lp_shares as u128)
            .ok_or(MeteraError::ArithmeticOverflow)? as u64;

        let token_b_amount = (lp_shares as u128)
            .checked_mul(pool.token_b_reserve as u128)
            .ok_or(MeteraError::ArithmeticOverflow)?
            .checked_div(pool.total_lp_shares as u128)
            .ok_or(MeteraError::ArithmeticOverflow)? as u64;

        // Transfer tokens from pool to LP
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.pool_token_a_vault.to_account_info(),
                    to: ctx.accounts.lp_token_a_account.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
            ),
            token_a_amount,
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.pool_token_b_vault.to_account_info(),
                    to: ctx.accounts.lp_token_b_account.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
            ),
            token_b_amount,
        )?;

        // Update pool and position
        pool.token_a_reserve = pool.token_a_reserve.checked_sub(token_a_amount).ok_or(MeteraError::ArithmeticOverflow)?;
        pool.token_b_reserve = pool.token_b_reserve.checked_sub(token_b_amount).ok_or(MeteraError::ArithmeticOverflow)?;
        pool.total_lp_shares = pool.total_lp_shares.checked_sub(lp_shares).ok_or(MeteraError::ArithmeticOverflow)?;
        lp_position.lp_shares = lp_position.lp_shares.checked_sub(lp_shares).ok_or(MeteraError::ArithmeticOverflow)?;

        emit!(LiquidityWithdrawn {
            pool: pool.key(),
            lp: ctx.accounts.lp.key(),
            lp_shares,
            token_a_amount,
            token_b_amount,
        });

        Ok(())
    }
}

// ============ ACCOUNTS & STRUCTS ============

#[derive(Accounts)]
#[instruction(principal: u64, total_expected_interest: u64, monthly_payment: u64, total_months: u32, vault_name: String)]
pub struct CreateVault<'info> {
    #[account(init, payer = authority, space = Vault::INIT_SPACE)]
    pub vault: Account<'info, Vault>,

    #[account(init, payer = authority, mint::decimals = 6, mint::authority = authority)]
    pub token_mint: Account<'info, Mint>,

    #[account(init, payer = authority, token::mint = token_mint, token::authority = vault)]
    pub vault_treasury: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct PurchaseTokensPrimary<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub vault_treasury: Account<'info, TokenAccount>,

    #[account(init, payer = buyer, space = PrimarySale::INIT_SPACE)]
    pub primary_sale: Account<'info, PrimarySale>,

    #[account(mut)]
    pub buyer_payment_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ReceiveMonthlyPayment<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub vault_treasury: Account<'info, TokenAccount>,

    #[account(init, payer = payer, space = MonthlyPaymentRecord::INIT_SPACE)]
    pub monthly_payment_record: Account<'info, MonthlyPaymentRecord>,

    #[account(mut)]
    pub payer_account: Account<'info, TokenAccount>,

    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct RedeemTokens<'info> {
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub vault_mut: Account<'info, Vault>,

    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub vault_treasury: Account<'info, TokenAccount>,

    #[account(mut)]
    pub monthly_payment_record: Account<'info, MonthlyPaymentRecord>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_payment_account: Account<'info, TokenAccount>,

    #[account(init, payer = user, space = RedemptionRecord::INIT_SPACE)]
    pub redemption_record: Account<'info, RedemptionRecord>,

    pub user: Signer<'info>,
    pub vault_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreateLiquidityPool<'info> {
    pub vault: Account<'info, Vault>,

    #[account(init, payer = authority, space = LiquidityPool::INIT_SPACE)]
    pub liquidity_pool: Account<'info, LiquidityPool>,

    pub token_a_mint: Account<'info, Mint>,
    pub token_b_mint: Account<'info, Mint>,

    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ProvideLiquidity<'info> {
    #[account(mut)]
    pub liquidity_pool: Account<'info, LiquidityPool>,

    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub lp_token_a_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub lp_token_b_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub pool_token_a_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub pool_token_b_vault: Account<'info, TokenAccount>,

    #[account(init, payer = lp, space = LPPosition::INIT_SPACE)]
    pub lp_position: Account<'info, LPPosition>,

    pub lp: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct WithdrawLiquidity<'info> {
    #[account(mut)]
    pub liquidity_pool: Account<'info, LiquidityPool>,

    #[account(mut)]
    pub lp_position: Account<'info, LPPosition>,

    #[account(mut)]
    pub lp_token_a_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub lp_token_b_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub pool_token_a_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub pool_token_b_vault: Account<'info, TokenAccount>,

    pub lp: Signer<'info>,
    pub pool_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub vault_treasury: Pubkey,
    pub principal: u64,
    pub total_expected_interest: u64,
    pub total_tokens_minted: u64,
    pub monthly_payment: u64,
    pub total_months: u32,
    pub current_month: u32,
    pub vault_name: String,
    pub created_at: i64,
    pub total_redeemed: u64,
    pub is_active: bool,
}

impl Vault {
    const INIT_SPACE: usize = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 4 + 4 + 64 + 8 + 8 + 1;
}

#[account]
pub struct PrimarySale {
    pub vault: Pubkey,
    pub buyer: Pubkey,
    pub token_amount: u64,
    pub purchase_price: u64,
    pub discount_percentage: u8,
    pub purchased_at: i64,
}

impl PrimarySale {
    const INIT_SPACE: usize = 8 + 32 + 32 + 8 + 8 + 1 + 8;
}

#[account]
pub struct MonthlyPaymentRecord {
    pub vault: Pubkey,
    pub month: u32,
    pub amount: u64,
    pub received_at: i64,
    pub available_for_redemption: u64,
}

impl MonthlyPaymentRecord {
    const INIT_SPACE: usize = 8 + 32 + 4 + 8 + 8 + 8;
}

#[account]
pub struct RedemptionRecord {
    pub vault: Pubkey,
    pub redeemer: Pubkey,
    pub token_amount: u64,
    pub redemption_value: u64,
    pub redeemed_at: i64,
    pub month: u32,
}

impl RedemptionRecord {
    const INIT_SPACE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 4;
}

#[account]
pub struct LiquidityPool {
    pub vault: Pubkey,
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub pool_authority: Pubkey,
    pub pool_name: String,
    pub created_at: i64,
    pub token_a_reserve: u64,
    pub token_b_reserve: u64,
    pub total_lp_shares: u64,
    pub window_start: i64,
    pub window_number: u64,
    pub is_active: bool,
}

impl LiquidityPool {
    const INIT_SPACE: usize = 8 + 32 + 32 + 32 + 32 + 64 + 8 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct LPPosition {
    pub pool: Pubkey,
    pub lp: Pubkey,
    pub token_a_amount: u64,
    pub token_b_amount: u64,
    pub lp_shares: u64,
    pub forward_discount_percentage: u8,
    pub window_number: u64,
    pub provided_at: i64,
}

impl LPPosition {
    const INIT_SPACE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 8 + 8;
}

// ============ EVENTS ============

#[event]
pub struct VaultCreated {
    pub vault: Pubkey,
    pub principal: u64,
    pub total_expected_interest: u64,
    pub total_tokens_minted: u64,
    pub monthly_payment: u64,
    pub total_months: u32,
}

#[event]
pub struct TokensMinted {
    pub vault: Pubkey,
    pub amount: u64,
    pub recipient: Pubkey,
}

#[event]
pub struct TokensPurchased {
    pub vault: Pubkey,
    pub buyer: Pubkey,
    pub token_amount: u64,
    pub purchase_price: u64,
    pub discount_percentage: u8,
}

#[event]
pub struct MonthlyPaymentReceived {
    pub vault: Pubkey,
    pub month: u32,
    pub amount: u64,
}

#[event]
pub struct TokensRedeemed {
    pub vault: Pubkey,
    pub redeemer: Pubkey,
    pub token_amount: u64,
    pub redemption_value: u64,
    pub month: u32,
}

#[event]
pub struct LiquidityPoolCreated {
    pub pool: Pubkey,
    pub vault: Pubkey,
    pub token_a: Pubkey,
    pub token_b: Pubkey,
    pub pool_name: String,
}

#[event]
pub struct LiquidityProvided {
    pub pool: Pubkey,
    pub lp: Pubkey,
    pub token_a_amount: u64,
    pub token_b_amount: u64,
    pub lp_shares: u64,
    pub forward_discount_percentage: u8,
}

#[event]
pub struct LiquidityWithdrawn {
    pub pool: Pubkey,
    pub lp: Pubkey,
    pub lp_shares: u64,
    pub token_a_amount: u64,
    pub token_b_amount: u64,
}

// ============ ERRORS ============

#[error_code]
pub enum MeteraError {
    #[msg("Vault is not active")]
    VaultInactive,

    #[msg("Vault has matured")]
    VaultMatured,

    #[msg("Exceeds total token supply")]
    ExceedsTokenSupply,

    #[msg("Invalid discount percentage")]
    InvalidDiscount,

    #[msg("Invalid payment amount")]
    InvalidPaymentAmount,

    #[msg("Insufficient redemption capacity")]
    InsufficientRedemptionCapacity,

    #[msg("Insufficient token balance")]
    InsufficientTokenBalance,

    #[msg("Pool is not active")]
    PoolInactive,

    #[msg("Insufficient LP shares")]
    InsufficientLPShares,

    #[msg("Zero liquidity pool")]
    ZeroLiquidityPool,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
}
