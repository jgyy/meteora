'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const features = [
    {
      id: 'vaults',
      icon: '🏦',
      title: 'Vaults',
      short: 'Create RWA vaults with monthly cash flows',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Create a Vault</h3>
          <p className="text-slate-300">Initialize a vault for your cash flow-generating contract with principal, interest, and monthly payment amounts.</p>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Required Information:</h4>
            <ul className="text-slate-300 space-y-1 text-sm">
              <li>• Vault Name</li>
              <li>• Principal Amount (USDC)</li>
              <li>• Total Expected Interest</li>
              <li>• Monthly Payment Amount</li>
              <li>• Duration (months)</li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/vaults')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Create Vault
          </button>
        </div>
      ),
    },
    {
      id: 'market',
      icon: '📊',
      title: 'Primary Market',
      short: 'Buy tokens at discounted prices',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Primary Market Sales</h3>
          <p className="text-slate-300">Purchase tokens at discounted prices during primary offerings. Investors receive proportional claims on all future payments.</p>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">How It Works:</h4>
            <ul className="text-slate-300 space-y-1 text-sm">
              <li>• Tokens issued at discount below par value</li>
              <li>• Each token = $1 par value</li>
              <li>• Early investors get best prices</li>
              <li>• Proportional claims on future cash flows</li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/market')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Browse Offerings
          </button>
        </div>
      ),
    },
    {
      id: 'redemptions',
      icon: '💰',
      title: 'Redemptions',
      short: 'Redeem tokens for monthly payments',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Monthly Redemptions</h3>
          <p className="text-slate-300">Process monthly payments and allow token holders to redeem at par value with available liquidity.</p>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Redemption Details:</h4>
            <ul className="text-slate-300 space-y-1 text-sm">
              <li>• First-come, first-served system</li>
              <li>• Redeem at par value ($1 per token)</li>
              <li>• Monthly payment cycles</li>
              <li>• Redeemed only when liquidity available</li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/redemptions')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            View Your Tokens
          </button>
        </div>
      ),
    },
    {
      id: 'liquidity',
      icon: '💧',
      title: 'Liquidity',
      short: 'Provide secondary market liquidity',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Liquidity Pools</h3>
          <p className="text-slate-300">Provide secondary market liquidity with 3-month rolling windows for token trading and redemptions.</p>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">LP Benefits:</h4>
            <ul className="text-slate-300 space-y-1 text-sm">
              <li>• Earn trading fees</li>
              <li>• Support secondary market</li>
              <li>• 3-month rolling windows</li>
              <li>• Flexible entry/exit</li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/liquidity')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Provide Liquidity
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Real World Asset Tokenization</h2>
        <p className="text-slate-300">Tokenize cash flows, trade RWAs, and manage liquidity on Solana</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setSelected(selected === feature.id ? null : feature.id)}
            className={`p-4 rounded-lg transition border ${
              selected === feature.id
                ? 'bg-slate-700 border-blue-500'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <h3 className="text-lg font-semibold text-white mb-1">{feature.icon} {feature.title}</h3>
            <p className="text-sm text-slate-300 text-left">{feature.short}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          {features.find((f) => f.id === selected)?.content}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-base font-semibold text-blue-400 mb-2">1. Create a Vault</h4>
          <p className="text-sm text-slate-300">Set up vault with principal, interest, and payment terms</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-base font-semibold text-blue-400 mb-2">2. Issue Tokens</h4>
          <p className="text-sm text-slate-300">Mint tokens with $1 par value per token</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-base font-semibold text-blue-400 mb-2">3. Primary Sales</h4>
          <p className="text-sm text-slate-300">Sell tokens at discount to investors</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-base font-semibold text-blue-400 mb-2">4. Redemptions</h4>
          <p className="text-sm text-slate-300">Process monthly payments and redemptions</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
