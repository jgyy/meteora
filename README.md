# Meteora - Real World Asset Tokenization Engine

Meteora is a decentralized finance protocol on Solana that enables tokenization of cash flow-generating contracts into Real World Assets (RWAs). The protocol features a complete ecosystem for creating, trading, and managing tokenized RWAs with dynamic liquidity provisioning.

## Features

### 1. Tokenization Engine
Transform any cash flow-generating contract into tokenized RWAs:
- Create vaults representing underlying assets
- Mint tokens with par value ($1 per token)
- Tokens = Principal + Total Expected Interest
- Automatic token distribution tied to cash flows

### 2. Distribution & Primary Market
Issue tokens to investors at discounted prices:
- Primary market discounts attract early investors
- Each token represents proportional claim on all future cash flows
- Customizable discount percentages
- Full transparency on vault parameters

### 3. Monthly Repayment Cycle
Systematic monthly cash flow processing:
- Vault receives 1/60th of total value monthly (60-month standard)
- Redemption value = Principal returned + Interest accrued to date
- Monthly redemption capacity limited to that month's payment
- First-come, first-served redemption model

### 4. Liquidity Provision Module
Secondary market liquidity through an innovative LP system:
- LPs provide buy-side liquidity at forward discounts
- 3-month rolling windows with monthly resets
- Flexible token pair support (RWA/RWA, RWA/Stablecoin, etc.)
- Fee earnings from secondary market activity

## Architecture

```
meteora/
├── programs/tokenization/          # Solana smart contracts (Anchor/Rust)
├── sdk/typescript/                 # TypeScript SDK for dApp integration
├── frontend/                       # Next.js web interface
└── tests/                          # Test suites
```

## Project Components

### Smart Contracts (`programs/tokenization/`)
Complete Anchor/Rust implementation of the tokenization protocol:
- **VaultAccount**: Stores vault parameters and state
- **PrimarySaleRecord**: Tracks discounted token purchases
- **MonthlyPaymentRecord**: Records incoming cash flows
- **RedemptionRecord**: Tracks token redemptions
- **LiquidityPool**: Secondary market pool management
- **LPPosition**: Individual LP positions

**Key Functions:**
- `create_vault` - Initialize new RWA vault
- `mint_tokens` - Issue tokens to accounts
- `purchase_tokens_primary` - Discounted token sales
- `receive_monthly_payment` - Process monthly cash flows
- `redeem_tokens` - First-come, first-served redemptions
- `create_liquidity_pool` - Create secondary market pool
- `provide_liquidity` - Add liquidity to pools
- `withdraw_liquidity` - Remove LP positions

### TypeScript SDK (`sdk/typescript/`)
Complete SDK for integrating Meteora into applications:

```typescript
import { MeteoraTokenizationClient } from '@meteora/tokenization-sdk';
import { Connection, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('devnet'));
const client = new MeteoraTokenizationClient(connection, programId);

// Create vault
await client.createVault(payer, {
  principal: BigInt(1_000_000_000_000), // 1M USDC
  totalExpectedInterest: BigInt(100_000_000_000), // 100k USDC
  monthlyPayment: BigInt(20_000_000_000), // 20k USDC
  totalMonths: 60,
  vaultName: 'Real Estate Fund 2024',
});

// Purchase tokens at discount
await client.purchaseTokensPrimary(
  buyer,
  authority,
  'Real Estate Fund 2024',
  buyerPaymentAccount,
  buyerTokenAccount,
  {
    tokenAmount: BigInt(100_000_000_000), // 100k tokens
    discountPercentage: 10, // 10% discount
  }
);

// Redeem tokens
await client.redeemTokens(
  user,
  vaultAuthority,
  'Real Estate Fund 2024',
  BigInt(50_000_000_000), // 50k tokens
  userTokenAccount,
  userPaymentAccount
);
```

**SDK Features:**
- Type-safe client library
- Transaction instruction builders
- PDA derivation utilities
- Amount formatting helpers
- Full TypeScript support

### Frontend (`frontend/`)
Modern Next.js application with full dApp functionality:

**Pages:**
- **Home** - Overview and feature explanation
- **Vaults** - Create and manage RWA vaults
- **Primary Market** - Browse and purchase tokens at discount
- **Redemptions** - Manage monthly token redemptions
- **Liquidity** - Provide and manage LP positions

**Features:**
- Wallet integration (Phantom, Solflare)
- Real-time vault information
- Interactive forms for all operations
- Responsive design with Tailwind CSS
- Dark mode optimized UI

## Development Setup

### Code Style & Quality

The project uses the following tools for code consistency:

- **Prettier** - Code formatting
- **ESLint** - TypeScript/JavaScript linting
- **EditorConfig** - Cross-editor consistency

Configuration files:
- `.prettierrc` - Prettier formatting rules
- `.eslintrc.json` - ESLint rules
- `.editorconfig` - Editor settings
- `.env.example` - Environment variables template

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Key variables:
- `NEXT_PUBLIC_SOLANA_RPC_URL` - Solana RPC endpoint
- `NEXT_PUBLIC_SOLANA_NETWORK` - Network (devnet/testnet/mainnet-beta)
- `NEXT_PUBLIC_METEORA_PROGRAM_ID` - Tokenization program ID

## Getting Started

### Prerequisites
- Node.js 18+
- Rust 1.70+ (for smart contracts)
- Solana CLI
- Anchor framework

### Installation

```bash
# Clone the repository
git clone https://github.com/jgyy/meteora.git
cd meteora

# Install all dependencies (root, SDK, and frontend)
npm install
```

This single command installs dependencies for all workspaces thanks to npm workspaces configuration.

### Building Smart Contracts

```bash
# Build contracts
cargo build-sbf --manifest-path programs/tokenization/Cargo.toml

# Run tests (when available)
cargo test --manifest-path programs/tokenization/Cargo.toml
```

### Available NPM Scripts

From the root directory, use these commands:

```bash
# Install all dependencies
npm install

# Build all workspaces (SDK and frontend)
npm run build

# Start frontend development server
npm run dev

# Run tests for all workspaces
npm run test

# Run linting for all workspaces
npm run lint
```

Or run workspace-specific commands:

```bash
# Build only the SDK
npm run build --workspace=@meteora/tokenization-sdk

# Build only the frontend
npm run build --workspace=@meteora/frontend

# Run frontend dev server
npm run dev --workspace=@meteora/frontend
```

## Usage Examples

### Create a Vault

```typescript
const params = {
  principal: BigInt(1_000_000 * 10**6), // 1M USDC (6 decimals)
  totalExpectedInterest: BigInt(100_000 * 10**6), // 100k USDC
  monthlyPayment: BigInt(20_000 * 10**6), // 20k USDC
  totalMonths: 60,
  vaultName: 'Commercial Real Estate Portfolio',
};

const signature = await client.createVault(payer, params);
```

### Purchase Tokens at Discount

```typescript
const signature = await client.purchaseTokensPrimary(
  buyer,
  authority,
  'Commercial Real Estate Portfolio',
  buyerUSDCAccount,
  buyerTokenAccount,
  {
    tokenAmount: BigInt(100_000 * 10**6),
    discountPercentage: 15, // 15% primary discount
  }
);
```

### Process Monthly Payment

```typescript
const signature = await client.receiveMonthlyPayment(
  payer,
  'Commercial Real Estate Portfolio',
  0, // Month index
  BigInt(20_000 * 10**6), // Monthly payment amount
  payerUSDCAccount
);
```

### Redeem Tokens

```typescript
const signature = await client.redeemTokens(
  user,
  vaultAuthority,
  'Commercial Real Estate Portfolio',
  BigInt(50_000 * 10**6), // Amount to redeem
  userTokenAccount,
  userUSDCAccount
);
```

### Provide Liquidity

```typescript
const signature = await client.provideLiquidity(
  lp,
  'Commercial Real Estate Portfolio',
  'RWA/USDC Pool',
  lpTokenAAccount,
  lpTokenBAccount,
  poolTokenAVault,
  poolTokenBVault,
  {
    tokenAAmount: BigInt(100_000 * 10**6),
    tokenBAmount: BigInt(100_000 * 10**6),
    forwardDiscountPercentage: 5,
  }
);
```

## Smart Contract Architecture

### Vault Flow
1. **Creation** - Initialize vault with cash flow parameters
2. **Token Minting** - Issue tokens representing claims
3. **Primary Sales** - Distribute at discounted prices
4. **Monthly Payments** - Receive cash flows
5. **Redemptions** - Token holders redeem at par value
6. **Liquidity** - Secondary market through LP pools

### Security Features
- Proper account validation and signer checks
- Arithmetic overflow/underflow protection
- First-come, first-served queue for redemptions
- Monthly window management for LP positions
- SPL token standard compliance

## Roadmap

- [ ] Advanced redemption queue system
- [ ] Automated monthly payment processing
- [ ] Dynamic discount pricing
- [ ] Analytics and reporting dashboard
- [ ] Multi-signature vault governance
- [ ] Integration with oracle services
- [ ] Mainnet deployment

## Testing

```bash
# Run smart contract tests
cargo test --manifest-path programs/tokenization/Cargo.toml

# Run SDK tests
cd sdk/typescript
npm run test
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

Licensed under the Apache License 2.0 - see LICENSE file for details.
