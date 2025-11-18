'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import VaultForm from '@/components/VaultForm';
import VaultList from '@/components/VaultList';

const VaultsPage = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [showForm, setShowForm] = useState(false);
  const [vaults, setVaults] = useState<any[]>([]);

  const handleVaultCreated = async () => {
    setShowForm(false);
    // Refresh vaults list
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Vaults</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          {showForm ? 'Cancel' : '+ Create Vault'}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Create New Vault</h3>
          <VaultForm onSuccess={handleVaultCreated} />
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Your Vaults</h3>
        {vaults.length === 0 ? (
          <p className="text-slate-400">
            {publicKey
              ? 'No vaults created yet. Create one to get started!'
              : 'Connect your wallet to view vaults.'}
          </p>
        ) : (
          <VaultList vaults={vaults} />
        )}
      </div>
    </div>
  );
};

export default VaultsPage;
