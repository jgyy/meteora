'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const RedemptionsPage = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [userTokens, setUserTokens] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Monthly Redemptions</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Tokens Held</p>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Available This Month</p>
          <p className="text-2xl font-bold text-green-400">0</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Redeemed</p>
          <p className="text-2xl font-bold text-blue-400">0</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Your Token Positions</h3>
        {userTokens.length === 0 ? (
          <p className="text-slate-400">
            {publicKey
              ? 'You have no token positions. Purchase tokens from the Primary Market.'
              : 'Connect your wallet to view your positions.'}
          </p>
        ) : (
          <div className="space-y-4">
            {userTokens.map((token) => (
              <div key={token.id} className="border border-slate-700 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{token.vaultName}</h4>
                  <span className="text-white font-bold">{token.amount} tokens</span>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Redeemable Value: {token.redeemableValue} USDC
                </p>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                  Redeem
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">How Redemptions Work</h3>
        <ul className="space-y-2 text-slate-300">
          <li>
            <strong>Monthly Cycle:</strong> Each month, vaults receive 1/60th of total expected value
          </li>
          <li>
            <strong>First-Come, First-Served:</strong> Holders redeem in order until monthly capacity is exhausted
          </li>
          <li>
            <strong>Par Value:</strong> Tokens redeem at $1 par value, combining principal return and interest accrual
          </li>
          <li>
            <strong>Queue System:</strong> If your redemption exceeds monthly capacity, it queues for next month
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RedemptionsPage;
