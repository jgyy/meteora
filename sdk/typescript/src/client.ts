import {
  Connection,
  PublicKey,
  Transaction,
  TransactionSignature,
  Signer,
} from '@solana/web3.js';
import { InstructionBuilder } from './instructions';
import {
  CreateVaultParams,
  PurchaseTokensParams,
  ProvideLiquidityParams,
  TransactionOptions,
  Vault,
  PrimarySale,
  MonthlyPaymentRecord,
  RedemptionRecord,
  LiquidityPool,
  LPPosition,
} from './types';
import {
  deriveVaultPda,
  deriveTokenMintPda,
  deriveVaultTreasuryPda,
  derivePrimarySalePda,
  deriveMonthlyPaymentPda,
  deriveRedemptionPda,
  deriveLiquidityPoolPda,
  deriveLPPositionPda,
  calculatePurchasePrice,
  calculateLPShares,
} from './utils';

/**
 * Main client for interacting with the Meteora Tokenization program
 */
export class MeteoraTokenizationClient {
  private connection: Connection;
  private programId: PublicKey;
  private instructionBuilder: InstructionBuilder;

  constructor(
    connection: Connection,
    programId: PublicKey,
  ) {
    this.connection = connection;
    this.programId = programId;
    this.instructionBuilder = new InstructionBuilder(programId);
  }

  /**
   * Create a new vault for RWA tokenization
   */
  async createVault(
    payer: Signer,
    params: CreateVaultParams,
    options?: TransactionOptions,
  ): Promise<TransactionSignature> {
    const [vaultPda] = deriveVaultPda(this.programId, params.vaultName);
    const [tokenMintPda] = deriveTokenMintPda(this.programId, vaultPda);
    const [vaultTreasuryPda] = deriveVaultTreasuryPda(this.programId, vaultPda);

    const instruction = this.instructionBuilder.createVault(
      vaultPda,
      tokenMintPda,
      vaultTreasuryPda,
      payer.publicKey,
      params,
    );

    const transaction = new Transaction().add(instruction);
    const signature = await this.connection.sendTransaction(transaction, [payer], {
      skipPreflight: options?.skipPreflight,
      maxRetries: options?.maxRetries,
    });

    if (options?.commitment) {
      await this.connection.confirmTransaction(signature, options.commitment);
    }

    return signature;
  }

  /**
   * Mint tokens to an account
   */
  async mintTokens(
    authority: Signer,
    vaultName: string,
    destination: PublicKey,
    amount: bigint,
    options?: TransactionOptions,
  ): Promise<TransactionSignature> {
    const [vaultPda] = deriveVaultPda(this.programId, vaultName);
    const [tokenMintPda] = deriveTokenMintPda(this.programId, vaultPda);

    const instruction = this.instructionBuilder.mintTokens(
      vaultPda,
      tokenMintPda,
      destination,
      authority.publicKey,
      amount,
    );

    const transaction = new Transaction().add(instruction);
    const signature = await this.connection.sendTransaction(transaction, [authority], {
      skipPreflight: options?.skipPreflight,
      maxRetries: options?.maxRetries,
    });

    if (options?.commitment) {
      await this.connection.confirmTransaction(signature, options.commitment);
    }

    return signature;
  }

  /**
   * Purchase tokens at primary market discount
   */
  async purchaseTokensPrimary(
    buyer: Signer,
    authority: Signer,
    vaultName: string,
    buyerPaymentAccount: PublicKey,
    buyerTokenAccount: PublicKey,
    params: PurchaseTokensParams,
    options?: TransactionOptions,
  ): Promise<TransactionSignature> {
    const [vaultPda] = deriveVaultPda(this.programId, vaultName);
    const [tokenMintPda] = deriveTokenMintPda(this.programId, vaultPda);
    const [vaultTreasuryPda] = deriveVaultTreasuryPda(this.programId, vaultPda);
    const [primarySalePda] = derivePrimarySalePda(
      this.programId,
      vaultPda,
      buyer.publicKey,
      0, // nonce - should be incremented for multiple purchases
    );

    const instruction = this.instructionBuilder.purchaseTokensPrimary(
      vaultPda,
      tokenMintPda,
      vaultTreasuryPda,
      primarySalePda,
      buyerPaymentAccount,
      buyerTokenAccount,
      buyer.publicKey,
      authority.publicKey,
      params,
    );

    const transaction = new Transaction().add(instruction);
    const signature = await this.connection.sendTransaction(
      transaction,
      [buyer, authority],
      {
        skipPreflight: options?.skipPreflight,
        maxRetries: options?.maxRetries,
      },
    );

    if (options?.commitment) {
      await this.connection.confirmTransaction(signature, options.commitment);
    }

    return signature;
  }

  /**
   * Receive monthly payment into vault
   */
  async receiveMonthlyPayment(
    payer: Signer,
    vaultName: string,
    month: number,
    paymentAmount: bigint,
    payerAccount: PublicKey,
    options?: TransactionOptions,
  ): Promise<TransactionSignature> {
    const [vaultPda] = deriveVaultPda(this.programId, vaultName);
    const [vaultTreasuryPda] = deriveVaultTreasuryPda(this.programId, vaultPda);
    const [monthlyPaymentPda] = deriveMonthlyPaymentPda(
      this.programId,
      vaultPda,
      month,
    );

    const instruction = this.instructionBuilder.receiveMonthlyPayment(
      vaultPda,
      vaultTreasuryPda,
      monthlyPaymentPda,
      payerAccount,
      payer.publicKey,
      paymentAmount,
    );

    const transaction = new Transaction().add(instruction);
    const signature = await this.connection.sendTransaction(transaction, [payer], {
      skipPreflight: options?.skipPreflight,
      maxRetries: options?.maxRetries,
    });

    if (options?.commitment) {
      await this.connection.confirmTransaction(signature, options.commitment);
    }

    return signature;
  }

  /**
   * Redeem tokens for cash flow
   */
  async redeemTokens(
    user: Signer,
    vaultAuthority: Signer,
    vaultName: string,
    tokenAmount: bigint,
    userTokenAccount: PublicKey,
    userPaymentAccount: PublicKey,
    options?: TransactionOptions,
  ): Promise<TransactionSignature> {
    const [vaultPda] = deriveVaultPda(this.programId, vaultName);
    const [tokenMintPda] = deriveTokenMintPda(this.programId, vaultPda);
    const [vaultTreasuryPda] = deriveVaultTreasuryPda(this.programId, vaultPda);

    // Get current month from vault data
    const vaultData = await this.getVault(vaultName);
    const [monthlyPaymentPda] = deriveMonthlyPaymentPda(
      this.programId,
      vaultPda,
      vaultData.currentMonth,
    );

    const [redemptionPda] = deriveRedemptionPda(
      this.programId,
      vaultPda,
      user.publicKey,
      0, // nonce
    );

    const instruction = this.instructionBuilder.redeemTokens(
      vaultPda,
      tokenMintPda,
      vaultTreasuryPda,
      monthlyPaymentPda,
      userTokenAccount,
      userPaymentAccount,
      redemptionPda,
      user.publicKey,
      vaultAuthority.publicKey,
      tokenAmount,
    );

    const transaction = new Transaction().add(instruction);
    const signature = await this.connection.sendTransaction(
      transaction,
      [user, vaultAuthority],
      {
        skipPreflight: options?.skipPreflight,
        maxRetries: options?.maxRetries,
      },
    );

    if (options?.commitment) {
      await this.connection.confirmTransaction(signature, options.commitment);
    }

    return signature;
  }

  /**
   * Create a liquidity pool for secondary market
   */
  async createLiquidityPool(
    authority: Signer,
    vaultName: string,
    tokenAMint: PublicKey,
    tokenBMint: PublicKey,
    poolName: string,
    options?: TransactionOptions,
  ): Promise<TransactionSignature> {
    const [vaultPda] = deriveVaultPda(this.programId, vaultName);
    const [liquidityPoolPda] = deriveLiquidityPoolPda(this.programId, vaultPda, poolName);

    const instruction = this.instructionBuilder.createLiquidityPool(
      vaultPda,
      liquidityPoolPda,
      tokenAMint,
      tokenBMint,
      authority.publicKey,
      poolName,
    );

    const transaction = new Transaction().add(instruction);
    const signature = await this.connection.sendTransaction(transaction, [authority], {
      skipPreflight: options?.skipPreflight,
      maxRetries: options?.maxRetries,
    });

    if (options?.commitment) {
      await this.connection.confirmTransaction(signature, options.commitment);
    }

    return signature;
  }

  /**
   * Provide liquidity to a pool
   */
  async provideLiquidity(
    lp: Signer,
    vaultName: string,
    poolName: string,
    lpTokenAAccount: PublicKey,
    lpTokenBAccount: PublicKey,
    poolTokenAVault: PublicKey,
    poolTokenBVault: PublicKey,
    params: ProvideLiquidityParams,
    options?: TransactionOptions,
  ): Promise<TransactionSignature> {
    const [vaultPda] = deriveVaultPda(this.programId, vaultName);
    const [liquidityPoolPda] = deriveLiquidityPoolPda(this.programId, vaultPda, poolName);
    const [lpPositionPda] = deriveLPPositionPda(this.programId, liquidityPoolPda, lp.publicKey);

    const instruction = this.instructionBuilder.provideLiquidity(
      liquidityPoolPda,
      vaultPda,
      lpTokenAAccount,
      lpTokenBAccount,
      poolTokenAVault,
      poolTokenBVault,
      lpPositionPda,
      lp.publicKey,
      params,
    );

    const transaction = new Transaction().add(instruction);
    const signature = await this.connection.sendTransaction(transaction, [lp], {
      skipPreflight: options?.skipPreflight,
      maxRetries: options?.maxRetries,
    });

    if (options?.commitment) {
      await this.connection.confirmTransaction(signature, options.commitment);
    }

    return signature;
  }

  /**
   * Withdraw liquidity from a pool
   */
  async withdrawLiquidity(
    lp: Signer,
    poolAuthority: Signer,
    vaultName: string,
    poolName: string,
    lpTokenAAccount: PublicKey,
    lpTokenBAccount: PublicKey,
    poolTokenAVault: PublicKey,
    poolTokenBVault: PublicKey,
    lpShares: bigint,
    options?: TransactionOptions,
  ): Promise<TransactionSignature> {
    const [vaultPda] = deriveVaultPda(this.programId, vaultName);
    const [liquidityPoolPda] = deriveLiquidityPoolPda(this.programId, vaultPda, poolName);
    const [lpPositionPda] = deriveLPPositionPda(this.programId, liquidityPoolPda, lp.publicKey);

    const instruction = this.instructionBuilder.withdrawLiquidity(
      liquidityPoolPda,
      lpPositionPda,
      lpTokenAAccount,
      lpTokenBAccount,
      poolTokenAVault,
      poolTokenBVault,
      lp.publicKey,
      poolAuthority.publicKey,
      lpShares,
    );

    const transaction = new Transaction().add(instruction);
    const signature = await this.connection.sendTransaction(
      transaction,
      [lp, poolAuthority],
      {
        skipPreflight: options?.skipPreflight,
        maxRetries: options?.maxRetries,
      },
    );

    if (options?.commitment) {
      await this.connection.confirmTransaction(signature, options.commitment);
    }

    return signature;
  }

  /**
   * Get vault data
   */
  async getVault(vaultName: string): Promise<Vault> {
    const [vaultPda] = deriveVaultPda(this.programId, vaultName);
    const accountInfo = await this.connection.getAccountInfo(vaultPda);

    if (!accountInfo) {
      throw new Error(`Vault not found: ${vaultName}`);
    }

    // Parse vault data from accountInfo.data
    // This is a simplified version - in production, use anchor's parsing
    const offset = 8; // Discriminator
    const data = accountInfo.data;

    return {
      authority: new PublicKey(data.slice(offset, offset + 32)),
      tokenMint: new PublicKey(data.slice(offset + 32, offset + 64)),
      vaultTreasury: new PublicKey(data.slice(offset + 64, offset + 96)),
      principal: data.readBigUInt64LE(offset + 96),
      totalExpectedInterest: data.readBigUInt64LE(offset + 104),
      totalTokensMinted: data.readBigUInt64LE(offset + 112),
      monthlyPayment: data.readBigUInt64LE(offset + 120),
      totalMonths: data.readUInt32LE(offset + 128),
      currentMonth: data.readUInt32LE(offset + 132),
      vaultName,
      createdAt: data.readBigInt64LE(offset + 136),
      totalRedeemed: data.readBigUInt64LE(offset + 144),
      isActive: data.readUInt8(offset + 152) === 1,
    };
  }

  /**
   * Get liquidity pool data
   */
  async getLiquidityPool(vaultName: string, poolName: string): Promise<LiquidityPool> {
    const [vaultPda] = deriveVaultPda(this.programId, vaultName);
    const [liquidityPoolPda] = deriveLiquidityPoolPda(this.programId, vaultPda, poolName);
    const accountInfo = await this.connection.getAccountInfo(liquidityPoolPda);

    if (!accountInfo) {
      throw new Error(`Liquidity pool not found: ${poolName}`);
    }

    const offset = 8;
    const data = accountInfo.data;

    return {
      vault: new PublicKey(data.slice(offset, offset + 32)),
      tokenAMint: new PublicKey(data.slice(offset + 32, offset + 64)),
      tokenBMint: new PublicKey(data.slice(offset + 64, offset + 96)),
      poolAuthority: new PublicKey(data.slice(offset + 96, offset + 128)),
      poolName,
      createdAt: data.readBigInt64LE(offset + 128),
      tokenAReserve: data.readBigUInt64LE(offset + 136),
      tokenBReserve: data.readBigUInt64LE(offset + 144),
      totalLpShares: data.readBigUInt64LE(offset + 152),
      windowStart: data.readBigInt64LE(offset + 160),
      windowNumber: data.readBigUInt64LE(offset + 168),
      isActive: data.readUInt8(offset + 176) === 1,
    };
  }

  /**
   * Get program ID
   */
  getProgramId(): PublicKey {
    return this.programId;
  }

  /**
   * Get connection
   */
  getConnection(): Connection {
    return this.connection;
  }
}
