import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  AccountMeta,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  CreateVaultParams,
  PurchaseTokensParams,
  ProvideLiquidityParams,
} from './types';

/**
 * Instruction builder for Meteora Tokenization Program
 */
export class InstructionBuilder {
  constructor(
    private programId: PublicKey,
  ) {}

  /**
   * Create a new RWA vault
   */
  createVault(
    vaultPda: PublicKey,
    tokenMintPda: PublicKey,
    vaultTreasuryPda: PublicKey,
    authority: PublicKey,
    params: CreateVaultParams,
  ): TransactionInstruction {
    const keys: AccountMeta[] = [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: tokenMintPda, isSigner: false, isWritable: true },
      { pubkey: vaultTreasuryPda, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];

    const data = Buffer.alloc(256);
    let offset = 0;

    // Discriminator for create_vault (0)
    data.writeUint8(0, offset);
    offset += 1;

    // Principal (u64)
    data.writeBigUInt64LE(params.principal, offset);
    offset += 8;

    // Total expected interest (u64)
    data.writeBigUInt64LE(params.totalExpectedInterest, offset);
    offset += 8;

    // Monthly payment (u64)
    data.writeBigUInt64LE(params.monthlyPayment, offset);
    offset += 8;

    // Total months (u32)
    data.writeUint32LE(params.totalMonths, offset);
    offset += 4;

    // Vault name (String: length + data)
    const nameBytes = Buffer.from(params.vaultName, 'utf-8');
    data.writeUint32LE(nameBytes.length, offset);
    offset += 4;
    nameBytes.copy(data, offset);
    offset += nameBytes.length;

    return new TransactionInstruction({
      programId: this.programId,
      keys,
      data: data.slice(0, offset),
    });
  }

  /**
   * Mint tokens to an account
   */
  mintTokens(
    vaultPda: PublicKey,
    tokenMint: PublicKey,
    destination: PublicKey,
    authority: PublicKey,
    amount: bigint,
  ): TransactionInstruction {
    const keys: AccountMeta[] = [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    const data = Buffer.alloc(16);
    let offset = 0;

    // Discriminator for mint_tokens (1)
    data.writeUint8(1, offset);
    offset += 1;

    // Amount (u64)
    data.writeBigUInt64LE(amount, offset);
    offset += 8;

    return new TransactionInstruction({
      programId: this.programId,
      keys,
      data: data.slice(0, offset),
    });
  }

  /**
   * Purchase tokens at primary market discount
   */
  purchaseTokensPrimary(
    vaultPda: PublicKey,
    tokenMint: PublicKey,
    vaultTreasuryPda: PublicKey,
    primarySalePda: PublicKey,
    buyerPaymentAccount: PublicKey,
    buyerTokenAccount: PublicKey,
    buyer: PublicKey,
    authority: PublicKey,
    params: PurchaseTokensParams,
  ): TransactionInstruction {
    const keys: AccountMeta[] = [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: true },
      { pubkey: vaultTreasuryPda, isSigner: false, isWritable: true },
      { pubkey: primarySalePda, isSigner: false, isWritable: true },
      { pubkey: buyerPaymentAccount, isSigner: false, isWritable: true },
      { pubkey: buyerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: buyer, isSigner: true, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];

    const data = Buffer.alloc(16);
    let offset = 0;

    // Discriminator for purchase_tokens_primary (2)
    data.writeUint8(2, offset);
    offset += 1;

    // Token amount (u64)
    data.writeBigUInt64LE(params.tokenAmount, offset);
    offset += 8;

    // Discount percentage (u8)
    data.writeUint8(params.discountPercentage, offset);
    offset += 1;

    return new TransactionInstruction({
      programId: this.programId,
      keys,
      data: data.slice(0, offset),
    });
  }

  /**
   * Receive monthly payment into vault
   */
  receiveMonthlyPayment(
    vaultPda: PublicKey,
    vaultTreasuryPda: PublicKey,
    monthlyPaymentRecordPda: PublicKey,
    payerAccount: PublicKey,
    payer: PublicKey,
    paymentAmount: bigint,
  ): TransactionInstruction {
    const keys: AccountMeta[] = [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: vaultTreasuryPda, isSigner: false, isWritable: true },
      { pubkey: monthlyPaymentRecordPda, isSigner: false, isWritable: true },
      { pubkey: payerAccount, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];

    const data = Buffer.alloc(16);
    let offset = 0;

    // Discriminator for receive_monthly_payment (3)
    data.writeUint8(3, offset);
    offset += 1;

    // Payment amount (u64)
    data.writeBigUInt64LE(paymentAmount, offset);
    offset += 8;

    return new TransactionInstruction({
      programId: this.programId,
      keys,
      data: data.slice(0, offset),
    });
  }

  /**
   * Redeem tokens for cash flow
   */
  redeemTokens(
    vaultPda: PublicKey,
    tokenMint: PublicKey,
    vaultTreasuryPda: PublicKey,
    monthlyPaymentRecordPda: PublicKey,
    userTokenAccount: PublicKey,
    userPaymentAccount: PublicKey,
    redemptionRecordPda: PublicKey,
    user: PublicKey,
    vaultAuthority: PublicKey,
    tokenAmount: bigint,
  ): TransactionInstruction {
    const keys: AccountMeta[] = [
      { pubkey: vaultPda, isSigner: false, isWritable: false },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: true },
      { pubkey: vaultTreasuryPda, isSigner: false, isWritable: true },
      { pubkey: monthlyPaymentRecordPda, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userPaymentAccount, isSigner: false, isWritable: true },
      { pubkey: redemptionRecordPda, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: vaultAuthority, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];

    const data = Buffer.alloc(16);
    let offset = 0;

    // Discriminator for redeem_tokens (4)
    data.writeUint8(4, offset);
    offset += 1;

    // Token amount (u64)
    data.writeBigUInt64LE(tokenAmount, offset);
    offset += 8;

    return new TransactionInstruction({
      programId: this.programId,
      keys,
      data: data.slice(0, offset),
    });
  }

  /**
   * Create a liquidity pool
   */
  createLiquidityPool(
    vaultPda: PublicKey,
    liquidityPoolPda: PublicKey,
    tokenAMint: PublicKey,
    tokenBMint: PublicKey,
    authority: PublicKey,
    poolName: string,
  ): TransactionInstruction {
    const keys: AccountMeta[] = [
      { pubkey: vaultPda, isSigner: false, isWritable: false },
      { pubkey: liquidityPoolPda, isSigner: false, isWritable: true },
      { pubkey: tokenAMint, isSigner: false, isWritable: false },
      { pubkey: tokenBMint, isSigner: false, isWritable: false },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];

    const data = Buffer.alloc(256);
    let offset = 0;

    // Discriminator for create_liquidity_pool (5)
    data.writeUint8(5, offset);
    offset += 1;

    // Pool name (String: length + data)
    const nameBytes = Buffer.from(poolName, 'utf-8');
    data.writeUint32LE(nameBytes.length, offset);
    offset += 4;
    nameBytes.copy(data, offset);
    offset += nameBytes.length;

    return new TransactionInstruction({
      programId: this.programId,
      keys,
      data: data.slice(0, offset),
    });
  }

  /**
   * Provide liquidity to pool
   */
  provideLiquidity(
    liquidityPoolPda: PublicKey,
    vaultPda: PublicKey,
    lpTokenAAccount: PublicKey,
    lpTokenBAccount: PublicKey,
    poolTokenAVault: PublicKey,
    poolTokenBVault: PublicKey,
    lpPositionPda: PublicKey,
    lp: PublicKey,
    params: ProvideLiquidityParams,
  ): TransactionInstruction {
    const keys: AccountMeta[] = [
      { pubkey: liquidityPoolPda, isSigner: false, isWritable: true },
      { pubkey: vaultPda, isSigner: false, isWritable: false },
      { pubkey: lpTokenAAccount, isSigner: false, isWritable: true },
      { pubkey: lpTokenBAccount, isSigner: false, isWritable: true },
      { pubkey: poolTokenAVault, isSigner: false, isWritable: true },
      { pubkey: poolTokenBVault, isSigner: false, isWritable: true },
      { pubkey: lpPositionPda, isSigner: false, isWritable: true },
      { pubkey: lp, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];

    const data = Buffer.alloc(32);
    let offset = 0;

    // Discriminator for provide_liquidity (6)
    data.writeUint8(6, offset);
    offset += 1;

    // Token A amount (u64)
    data.writeBigUInt64LE(params.tokenAAmount, offset);
    offset += 8;

    // Token B amount (u64)
    data.writeBigUInt64LE(params.tokenBAmount, offset);
    offset += 8;

    // Forward discount percentage (u8)
    data.writeUint8(params.forwardDiscountPercentage, offset);
    offset += 1;

    return new TransactionInstruction({
      programId: this.programId,
      keys,
      data: data.slice(0, offset),
    });
  }

  /**
   * Withdraw liquidity from pool
   */
  withdrawLiquidity(
    liquidityPoolPda: PublicKey,
    lpPositionPda: PublicKey,
    lpTokenAAccount: PublicKey,
    lpTokenBAccount: PublicKey,
    poolTokenAVault: PublicKey,
    poolTokenBVault: PublicKey,
    lp: PublicKey,
    poolAuthority: PublicKey,
    lpShares: bigint,
  ): TransactionInstruction {
    const keys: AccountMeta[] = [
      { pubkey: liquidityPoolPda, isSigner: false, isWritable: true },
      { pubkey: lpPositionPda, isSigner: false, isWritable: true },
      { pubkey: lpTokenAAccount, isSigner: false, isWritable: true },
      { pubkey: lpTokenBAccount, isSigner: false, isWritable: true },
      { pubkey: poolTokenAVault, isSigner: false, isWritable: true },
      { pubkey: poolTokenBVault, isSigner: false, isWritable: true },
      { pubkey: lp, isSigner: true, isWritable: false },
      { pubkey: poolAuthority, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    const data = Buffer.alloc(16);
    let offset = 0;

    // Discriminator for withdraw_liquidity (7)
    data.writeUint8(7, offset);
    offset += 1;

    // LP shares (u64)
    data.writeBigUInt64LE(lpShares, offset);
    offset += 8;

    return new TransactionInstruction({
      programId: this.programId,
      keys,
      data: data.slice(0, offset),
    });
  }
}
