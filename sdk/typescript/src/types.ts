import { PublicKey } from '@solana/web3.js';

/**
 * Vault account containing RWA tokenization parameters
 */
export interface Vault {
  authority: PublicKey;
  tokenMint: PublicKey;
  vaultTreasury: PublicKey;
  principal: bigint;
  totalExpectedInterest: bigint;
  totalTokensMinted: bigint;
  monthlyPayment: bigint;
  totalMonths: number;
  currentMonth: number;
  vaultName: string;
  createdAt: bigint;
  totalRedeemed: bigint;
  isActive: boolean;
}

/**
 * Primary market sale record
 */
export interface PrimarySale {
  vault: PublicKey;
  buyer: PublicKey;
  tokenAmount: bigint;
  purchasePrice: bigint;
  discountPercentage: number;
  purchasedAt: bigint;
}

/**
 * Monthly payment record for a vault
 */
export interface MonthlyPaymentRecord {
  vault: PublicKey;
  month: number;
  amount: bigint;
  receivedAt: bigint;
  availableForRedemption: bigint;
}

/**
 * Redemption record for token redemptions
 */
export interface RedemptionRecord {
  vault: PublicKey;
  redeemer: PublicKey;
  tokenAmount: bigint;
  redemptionValue: bigint;
  redeemedAt: bigint;
  month: number;
}

/**
 * Liquidity pool account for secondary market
 */
export interface LiquidityPool {
  vault: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  poolAuthority: PublicKey;
  poolName: string;
  createdAt: bigint;
  tokenAReserve: bigint;
  tokenBReserve: bigint;
  totalLpShares: bigint;
  windowStart: bigint;
  windowNumber: bigint;
  isActive: boolean;
}

/**
 * LP position in a liquidity pool
 */
export interface LPPosition {
  pool: PublicKey;
  lp: PublicKey;
  tokenAAmount: bigint;
  tokenBAmount: bigint;
  lpShares: bigint;
  forwardDiscountPercentage: number;
  windowNumber: bigint;
  providedAt: bigint;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  commitment?: 'confirmed' | 'finalized' | 'processed';
  skipPreflight?: boolean;
  maxRetries?: number;
}

/**
 * Create vault parameters
 */
export interface CreateVaultParams {
  principal: bigint;
  totalExpectedInterest: bigint;
  monthlyPayment: bigint;
  totalMonths: number;
  vaultName: string;
}

/**
 * Purchase tokens parameters
 */
export interface PurchaseTokensParams {
  tokenAmount: bigint;
  discountPercentage: number;
}

/**
 * Provide liquidity parameters
 */
export interface ProvideLiquidityParams {
  tokenAAmount: bigint;
  tokenBAmount: bigint;
  forwardDiscountPercentage: number;
}

/**
 * Event data types
 */
export interface VaultCreatedEvent {
  vault: PublicKey;
  principal: bigint;
  totalExpectedInterest: bigint;
  totalTokensMinted: bigint;
  monthlyPayment: bigint;
  totalMonths: number;
}

export interface TokensPurchasedEvent {
  vault: PublicKey;
  buyer: PublicKey;
  tokenAmount: bigint;
  purchasePrice: bigint;
  discountPercentage: number;
}

export interface TokensRedeemedEvent {
  vault: PublicKey;
  redeemer: PublicKey;
  tokenAmount: bigint;
  redemptionValue: bigint;
  month: number;
}

export interface LiquidityProvidedEvent {
  pool: PublicKey;
  lp: PublicKey;
  tokenAAmount: bigint;
  tokenBAmount: bigint;
  lpShares: bigint;
  forwardDiscountPercentage: number;
}
