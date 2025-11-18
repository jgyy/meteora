'use client';

import Link from 'next/link';

interface Vault {
  id: string;
  name: string;
  principal: number;
  totalExpectedInterest: number;
  monthlyPayment: number;
  totalMonths: number;
  currentMonth: number;
  isActive: boolean;
}

interface VaultListProps {
  vaults: Vault[];
}

const VaultList = ({ vaults }: VaultListProps) => {
  if (vaults.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No vaults available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vaults.map((vault) => (
        <div
          key={vault.id}
          className="border border-slate-700 rounded-lg p-4 hover:bg-slate-700 transition"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="text-lg font-semibold text-white">{vault.name}</h4>
              <p className="text-slate-400 text-sm">
                Month {vault.currentMonth + 1} of {vault.totalMonths}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                vault.isActive
                  ? 'bg-green-900 text-green-200'
                  : 'bg-red-900 text-red-200'
              }`}
            >
              {vault.isActive ? 'Active' : 'Closed'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-slate-400 text-xs">Principal</p>
              <p className="text-white font-medium">
                ${(vault.principal / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Expected Interest</p>
              <p className="text-white font-medium">
                ${(vault.totalExpectedInterest / 1000000).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Monthly Payment</p>
              <p className="text-white font-medium">
                ${(vault.monthlyPayment / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Value</p>
              <p className="text-white font-medium">
                ${(
                  (vault.principal + vault.totalExpectedInterest) /
                  1000000
                ).toFixed(1)}M
              </p>
            </div>
          </div>

          <div className="w-full bg-slate-700 rounded h-2 mb-4">
            <div
              className="bg-blue-500 h-full rounded"
              style={{
                width: `${(vault.currentMonth / vault.totalMonths) * 100}%`,
              }}
            />
          </div>

          <div className="flex gap-2">
            <Link href={`/vaults/${vault.id}`}>
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                View Details
              </button>
            </Link>
            {vault.isActive && (
              <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition">
                Manage
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VaultList;
