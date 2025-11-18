'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const LiquidityPage = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  // LP Tier data
  const lpTiers = [
    {
      id: 'tier1',
      name: 'Basic',
      minAmount: '$1K',
      maxAmount: '$10K',
      apy: 10,
      features: ['Standard trading fees', 'Monthly windows', 'Email support'],
      monthlyReturn10k: 83,
      riskLevel: 'Low',
    },
    {
      id: 'tier2',
      name: 'Pro',
      minAmount: '$10K',
      maxAmount: '$100K',
      apy: 15,
      features: ['Priority fee share', 'Advanced analytics', 'Discord support', 'Partial IL insurance (3%)'],
      monthlyReturn100k: 1250,
      riskLevel: 'Moderate',
    },
    {
      id: 'tier3',
      name: 'Institutional',
      minAmount: '$100K',
      maxAmount: 'Unlimited',
      apy: 22,
      features: ['Dedicated account manager', 'Custom pool strategies', '24/7 support', 'Full IL insurance (5%)', 'Auto-compounding'],
      monthlyReturn1m: 1833,
      riskLevel: 'Managed',
    },
  ];

  const stats = [
    { label: 'Total Protocol TVL', value: '$2.45M' },
    { label: 'Average LP APY', value: '15.8%' },
    { label: 'Active LPs', value: '342' },
    { label: 'Monthly Volume', value: '$850K' },
  ];

  const competitiveData = [
    { protocol: 'Meteora', assetType: 'RWA (Stable)', ilRisk: 'Low (3-8%)', apy: '15-25%', insurance: '✓ 5% covered', management: '✓ Curated' },
    { protocol: 'Uniswap V3', assetType: 'Volatile crypto', ilRisk: 'High (15-40%)', apy: '5-12%', insurance: '✗ None', management: '✗ Self-service' },
    { protocol: 'Aave', assetType: 'Mixed', ilRisk: 'Medium (8-15%)', apy: '8-15%', insurance: '✗ None', management: '✗ Self-service' },
  ];

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Liquidity Pools</h2>
        <p className="text-slate-400 text-sm">Curated LP program with managed risk, predictable returns, and built-in insurance. RWA-focused pools earn 10-25% APY.</p>
      </div>


      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4">Liquidity Models Explained</h3>

        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h4 className="text-lg font-bold text-blue-400 mb-3">1. Traditional AMM (Uniswap V2)</h4>
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                Liquidity spread uniformly across entire price range (0 to ∞). All LP capital earns equally across all prices.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-green-400 font-semibold text-sm mb-2">✓ Advantages</p>
                  <ul className="text-slate-300 text-xs space-y-1">
                    <li>• Simple & passive</li>
                    <li>• Universal compatibility</li>
                    <li>• No active management</li>
                  </ul>
                </div>
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-red-400 font-semibold text-sm mb-2">✗ Disadvantages</p>
                  <ul className="text-slate-300 text-xs space-y-1">
                    <li>• 80% capital idle</li>
                    <li>• High impermanent loss (15-40%)</li>
                    <li>• Low APY (5-8%)</li>
                  </ul>
                </div>
              </div>
              <p className="text-slate-400 text-xs">Example: RWA at $1.00 → only 2% of liquidity actually used in $0.99-$1.01 range</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h4 className="text-lg font-bold text-purple-400 mb-3">2. Concentrated Liquidity (Uniswap V3)</h4>
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                LPs choose custom price range. Capital concentrated in narrow band. Requires active management.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-green-400 font-semibold text-sm mb-2">✓ Advantages</p>
                  <ul className="text-slate-300 text-xs space-y-1">
                    <li>• 50-60% capital efficiency</li>
                    <li>• Higher fee yield</li>
                    <li>• Better for volatile pairs</li>
                  </ul>
                </div>
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-red-400 font-semibold text-sm mb-2">✗ Disadvantages</p>
                  <ul className="text-slate-300 text-xs space-y-1">
                    <li>• Complex management</li>
                    <li>• High IL if price moves out</li>
                    <li>• Requires rebalancing</li>
                  </ul>
                </div>
              </div>
              <p className="text-slate-400 text-xs">Example: Set range $0.95-$1.05 → if price goes to $1.10, position becomes inactive, all IL</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 border-green-500">
            <h4 className="text-lg font-bold text-green-400 mb-3">3. DLMM - Dynamic Liquidity Market Maker (Meteora)</h4>
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                Liquidity organized in dynamic price bins. Fees adjust based on volatility. Auto-rebalances across bins.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-green-400 font-semibold text-sm mb-2">✓ Advantages</p>
                  <ul className="text-slate-300 text-xs space-y-1">
                    <li>• 80%+ capital efficiency</li>
                    <li>• Dynamic fees (volatility-based)</li>
                    <li>• Low IL (2-5% for RWA)</li>
                    <li>• Auto-rebalancing</li>
                    <li>• 15-25% APY</li>
                  </ul>
                </div>
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-yellow-400 font-semibold text-sm mb-2">⚠ Considerations</p>
                  <ul className="text-slate-300 text-xs space-y-1">
                    <li>• Moderate complexity</li>
                    <li>• Specialized for stable pairs</li>
                    <li>• Lower fees for high volatility</li>
                  </ul>
                </div>
              </div>
              <p className="text-green-300 text-xs font-semibold">Best for RWA tokenization</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h4 className="text-lg font-bold text-orange-400 mb-3">Model Comparison Table</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-2 text-white">Model</th>
                    <th className="text-center py-2 px-2">Capital Efficiency</th>
                    <th className="text-center py-2 px-2">IL Risk</th>
                    <th className="text-center py-2 px-2">APY</th>
                    <th className="text-center py-2 px-2">Complexity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 px-2 font-semibold">Traditional AMM</td>
                    <td className="text-center text-red-400">⭐ 20%</td>
                    <td className="text-center text-red-400">Very High</td>
                    <td className="text-center text-yellow-400">5-8%</td>
                    <td className="text-center text-green-400">Easy</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 px-2 font-semibold">Concentrated Liquidity</td>
                    <td className="text-center text-yellow-400">⭐⭐⭐ 50-60%</td>
                    <td className="text-center text-yellow-400">High</td>
                    <td className="text-center text-yellow-400">10-15%</td>
                    <td className="text-center text-red-400">Hard</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-semibold text-green-400">DLMM</td>
                    <td className="text-center text-green-400">⭐⭐⭐⭐⭐ 80%+</td>
                    <td className="text-center text-green-400">Low</td>
                    <td className="text-center text-green-400">15-25%</td>
                    <td className="text-center text-yellow-400">Moderate</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h4 className="text-white font-bold mb-3">Why Meteora Chose DLMM</h4>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-blue-400 font-semibold">RWA assets have low volatility.</span> Traditional AMM wastes 80% of capital on unused price ranges. DLMM concentrates liquidity where prices actually trade, making every dollar count.
              </p>
              <p>
                <span className="text-green-400 font-semibold">2% vs 10% impermanent loss.</span> For a $100K position, DLMM saves $8K in losses vs traditional AMM. Over a year, that's massive.
              </p>
              <p>
                <span className="text-purple-400 font-semibold">Dynamic fees adjust to volatility.</span> When market gets choppy, fees increase. When stable, fees decrease. LPs get paid more when they deserve it most.
              </p>
              <p>
                <span className="text-yellow-400 font-semibold">15-25% APY vs 5-12% APY.</span> Better economics = more attractive to institutional LPs and retail participants.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Liquidity Provision Flow</h3>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[150px]">
              <div className="bg-blue-900 border-2 border-blue-500 rounded-lg p-4 text-center">
                <p className="text-white font-semibold text-sm">1. Select Pool</p>
                <p className="text-blue-300 text-xs mt-1">Choose from available pools</p>
              </div>
            </div>
            <div className="text-blue-400 font-bold text-2xl">→</div>
            <div className="flex-1 min-w-[150px]">
              <div className="bg-blue-900 border-2 border-blue-500 rounded-lg p-4 text-center">
                <p className="text-white font-semibold text-sm">2. Enter Amount</p>
                <p className="text-blue-300 text-xs mt-1">USDC or RWA tokens</p>
              </div>
            </div>
            <div className="text-blue-400 font-bold text-2xl">→</div>
            <div className="flex-1 min-w-[150px]">
              <div className="bg-blue-900 border-2 border-blue-500 rounded-lg p-4 text-center">
                <p className="text-white font-semibold text-sm">3. Approve</p>
                <p className="text-blue-300 text-xs mt-1">Sign approval tx</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="text-blue-400 font-bold text-2xl">↓</div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <div className="bg-green-900 border-2 border-green-500 rounded-lg p-4 text-center">
                <p className="text-white font-semibold text-sm">4. Provide Liquidity</p>
                <p className="text-green-300 text-xs mt-1">Sign transaction</p>
              </div>
            </div>
            <div className="text-green-400 font-bold text-2xl">→</div>
            <div className="flex-1 min-w-[150px]">
              <div className="bg-green-900 border-2 border-green-500 rounded-lg p-4 text-center">
                <p className="text-white font-semibold text-sm">5. Receive LP Shares</p>
                <p className="text-green-300 text-xs mt-1">Start earning fees</p>
              </div>
            </div>
            <div className="text-green-400 font-bold text-2xl">→</div>
            <div className="flex-1 min-w-[150px]">
              <div className="bg-green-900 border-2 border-green-500 rounded-lg p-4 text-center">
                <p className="text-white font-semibold text-sm">6. Withdraw</p>
                <p className="text-green-300 text-xs mt-1">Redeem LP shares</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Rolling Window Timeline</h3>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Month 1 - Window Opens</p>
                <p className="text-slate-400 text-sm">New 3-month window starts with forward discount (3-12%)</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Months 1-3 - Liquidity Active</p>
                <p className="text-slate-400 text-sm">LPs earn trading fees, users can redeem tokens at par value</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Month 3 - Window Closes</p>
                <p className="text-slate-400 text-sm">LPs can withdraw liquidity, old window ends</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  4
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Month 4 - New Window Begins</p>
                <p className="text-slate-400 text-sm">Cycle repeats with new discount rates for next window</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Revenue Stream</h3>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-yellow-500">
              <p className="text-yellow-400 font-semibold text-sm mb-2">Trading Fees</p>
              <p className="text-slate-300 text-xs">Earn % of swap fees from secondary market activity</p>
              <p className="text-white font-bold text-lg mt-2">Up to 0.30%</p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-green-400 font-semibold text-sm mb-2">Redemption Fees</p>
              <p className="text-slate-300 text-xs">Small fee when tokens redeemed from liquidity</p>
              <p className="text-white font-bold text-lg mt-2">0.5-1%</p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-blue-400 font-semibold text-sm mb-2">Protocol Revenue</p>
              <p className="text-slate-300 text-xs">Share of protocol-generated revenue</p>
              <p className="text-white font-bold text-lg mt-2">Variable</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4">Learn More About LP Models & Economics</h3>
        <p className="text-slate-400 text-sm mb-4">Explore external resources to deepen your understanding of liquidity provision, fee structures, and advanced strategies.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-blue-500 transition">
            <h4 className="text-white font-semibold mb-2">Business Models</h4>
            <p className="text-slate-300 text-sm mb-3">Understanding different LP business models and fee structures</p>
            <div className="space-y-2">
              <a href="https://medium.com/@necheremnwabuko/why-and-how-to-use-dlmm-1a05338b9316" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → Why and How to Use DLMM (Medium)
              </a>
              <a href="https://blog.1inch.com/challenges-of-liquidity-provision-defi/" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → DeFi Liquidity Provision Challenges (1inch)
              </a>
              <a href="https://academy.swissborg.com/en/learn/meteora-vs-raydium" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → Meteora vs Raydium Comparison (SwissBorg)
              </a>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-green-500 transition">
            <h4 className="text-white font-semibold mb-2">LP Economics & Profitability</h4>
            <p className="text-slate-300 text-sm mb-3">Deep dives into LP earnings, APY calculations, and fee mechanics</p>
            <div className="space-y-2">
              <a href="https://hackernoon.com/defi-liquidity-providers-factors-affecting-profitability-trade-offs-and-risk-return-profiles-at7o376h" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → DeFi LP Profitability Analysis (HackerNoon)
              </a>
              <a href="https://medium.com/coinmonks/profitable-defi-liquidity-provision-in-2024-myth-or-fact-7c1a0c0a3a31" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → Profitable DeFi LP in 2024 (Coinmonks)
              </a>
              <a href="https://liquidity-provider.com/articles/how-to-earn-passive-income-with-defi-in-2024/" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → Passive Income with DeFi (Liquidity Provider)
              </a>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-purple-500 transition">
            <h4 className="text-white font-semibold mb-2">Impermanent Loss & Risk</h4>
            <p className="text-slate-300 text-sm mb-3">Understanding IL, concentration strategies, and risk mitigation</p>
            <div className="space-y-2">
              <a href="https://docs.raydium.io/raydium/liquidity-providers/liquidity-pools" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → Constant Product Liquidity (Raydium Docs)
              </a>
              <a href="https://docs.raydium.io/raydium/liquidity-providers/providing-concentrated-liquidity-clmm/intro-on-concentrated-liquidity" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → Concentrated Liquidity Guide (Raydium)
              </a>
              <a href="https://medium.com/@accesstoarpan/meteoras-dynamic-liquidity-market-maker-dlmm-7d9e692e6969" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → Meteora's DLMM Explained (Medium)
              </a>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-yellow-500 transition">
            <h4 className="text-white font-semibold mb-2">Advanced Strategies</h4>
            <p className="text-slate-300 text-sm mb-3">Multi-tier strategies, auto-compounding, and yield optimization</p>
            <div className="space-y-2">
              <a href="https://www.debutinfotech.com/blog/top-10-defi-strategies-to-earn-passive-income" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → Top 10 DeFi Yield Strategies (Debut)
              </a>
              <a href="https://www.bis.org/publ/qtrpdf/r_qt2112b.pdf" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → DeFi Risks & Analysis (BIS Research)
              </a>
              <a href="https://docs.raydium.io/raydium/liquidity-providers/liquidity-providing-faq" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 text-sm">
                → LP FAQ & Best Practices (Raydium)
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="font-semibold text-white mb-3">How Liquidity Pools Work</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>• Provide buy-side liquidity at forward discounts (3-12% depending on window)</li>
          <li>• Earn trading fees from secondary market token swaps</li>
          <li>• APY varies by pool TVL and trading volume</li>
          <li>• Liquidity windows reset monthly with new discount rates</li>
          <li>• Withdraw anytime during active window</li>
        </ul>
      </div>
    </div>
  );
};

export default LiquidityPage;
