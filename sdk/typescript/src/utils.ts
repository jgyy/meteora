import { PublicKey } from '@solana/web3.js';

/**
 * Helper functions for Meteora Tokenization SDK
 */

/**
 * Derive a PDA for a vault
 */
export function deriveVaultPda(
  programId: PublicKey,
  vaultName: string,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), Buffer.from(vaultName)],
    programId,
  );
}

/**
 * Derive a PDA for token mint
 */
export function deriveTokenMintPda(
  programId: PublicKey,
  vault: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('mint'), vault.toBuffer()],
    programId,
  );
}

/**
 * Derive a PDA for vault treasury
 */
export function deriveVaultTreasuryPda(
  programId: PublicKey,
  vault: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('treasury'), vault.toBuffer()],
    programId,
  );
}

/**
 * Derive a PDA for primary sale record
 */
export function derivePrimarySalePda(
  programId: PublicKey,
  vault: PublicKey,
  buyer: PublicKey,
  nonce: number,
): [PublicKey, number] {
  const nonceBuffer = Buffer.alloc(4);
  nonceBuffer.writeUint32LE(nonce);

  return PublicKey.findProgramAddressSync(
    [Buffer.from('sale'), vault.toBuffer(), buyer.toBuffer(), nonceBuffer],
    programId,
  );
}

/**
 * Derive a PDA for monthly payment record
 */
export function deriveMonthlyPaymentPda(
  programId: PublicKey,
  vault: PublicKey,
  month: number,
): [PublicKey, number] {
  const monthBuffer = Buffer.alloc(4);
  monthBuffer.writeUint32LE(month);

  return PublicKey.findProgramAddressSync(
    [Buffer.from('payment'), vault.toBuffer(), monthBuffer],
    programId,
  );
}

/**
 * Derive a PDA for redemption record
 */
export function deriveRedemptionPda(
  programId: PublicKey,
  vault: PublicKey,
  redeemer: PublicKey,
  nonce: number,
): [PublicKey, number] {
  const nonceBuffer = Buffer.alloc(4);
  nonceBuffer.writeUint32LE(nonce);

  return PublicKey.findProgramAddressSync(
    [Buffer.from('redemption'), vault.toBuffer(), redeemer.toBuffer(), nonceBuffer],
    programId,
  );
}

/**
 * Derive a PDA for liquidity pool
 */
export function deriveLiquidityPoolPda(
  programId: PublicKey,
  vault: PublicKey,
  poolName: string,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), vault.toBuffer(), Buffer.from(poolName)],
    programId,
  );
}

/**
 * Derive a PDA for LP position
 */
export function deriveLPPositionPda(
  programId: PublicKey,
  pool: PublicKey,
  lp: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('lp_position'), pool.toBuffer(), lp.toBuffer()],
    programId,
  );
}

/**
 * Calculate purchase price with discount
 */
export function calculatePurchasePrice(
  tokenAmount: bigint,
  discountPercentage: number,
): bigint {
  const discountAmount = (tokenAmount * BigInt(discountPercentage)) / BigInt(100);
  return tokenAmount - discountAmount;
}

/**
 * Calculate proportional LP shares (simplified formula)
 */
export function calculateLPShares(
  tokenAAmount: bigint,
  tokenBAmount: bigint,
  poolTokenAReserve: bigint,
  poolTokenBReserve: bigint,
  totalLPShares: bigint,
): bigint {
  if (totalLPShares === BigInt(0)) {
    // Initial liquidity: geometric mean
    return sqrt(tokenAAmount * tokenBAmount);
  }

  // Proportional shares
  const aRatio = (tokenAAmount * totalLPShares) / poolTokenAReserve;
  const bRatio = (tokenBAmount * totalLPShares) / poolTokenBReserve;

  return aRatio < bRatio ? aRatio : bRatio;
}

/**
 * Integer square root helper function
 */
function sqrt(n: bigint): bigint {
  if (n === BigInt(0)) return BigInt(0);
  if (n === BigInt(1)) return BigInt(1);

  let x = n;
  let y = (x + BigInt(1)) / BigInt(2);

  while (y < x) {
    x = y;
    y = (x + n / x) / BigInt(2);
  }

  return x;
}

/**
 * Convert amount to display format with decimals
 */
export function formatAmount(amount: bigint, decimals: number = 6): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;

  const fractionalStr = fractionalPart
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '');

  if (fractionalStr === '') {
    return integerPart.toString();
  }

  return `${integerPart}.${fractionalStr}`;
}

/**
 * Convert display format to amount with decimals
 */
export function parseAmount(amount: string, decimals: number = 6): bigint {
  const [integerStr, fractionalStr = ''] = amount.split('.');

  const integerPart = BigInt(integerStr || '0');
  const fractionalPart = BigInt(
    fractionalStr.padEnd(decimals, '0').slice(0, decimals),
  );

  const multiplier = BigInt(10 ** decimals);
  return integerPart * multiplier + fractionalPart;
}
