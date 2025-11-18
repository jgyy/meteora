'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const MarketPage = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [marketListings, setMarketListings] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Primary Market</h2>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Available Offerings</h3>
        {marketListings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No offerings available at the moment</p>
            <p className="text-slate-500 text-sm">
              Check back later for new RWA token offerings with discounted primary prices
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {marketListings.map((listing) => (
              <div key={listing.id} className="border border-slate-700 rounded p-4 hover:bg-slate-700 transition">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{listing.vaultName}</h4>
                  <span className="text-green-400 font-bold">{listing.discount}% OFF</span>
                </div>
                <p className="text-slate-300 text-sm mb-4">{listing.description}</p>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition">
                  Purchase Tokens
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">How Primary Market Works</h3>
        <ul className="space-y-2 text-slate-300">
          <li>• Investors purchase RWA tokens at a discounted primary price</li>
          <li>• Each token represents a proportional claim on all future cash flows</li>
          <li>• Tokens are issued with par value equal to principal + expected interest</li>
          <li>• Limited time offerings with attractive discount percentages</li>
        </ul>
      </div>
    </div>
  );
};

export default MarketPage;
