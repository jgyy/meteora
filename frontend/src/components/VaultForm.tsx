'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

interface VaultFormProps {
  onSuccess: () => void;
}

const VaultForm = ({ onSuccess }: VaultFormProps) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vaultName: '',
    principal: '',
    totalExpectedInterest: '',
    monthlyPayment: '',
    totalMonths: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    setLoading(true);
    try {
      // TODO: Integrate with SDK to create vault
      console.log('Creating vault with:', formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating vault:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white font-medium mb-2">Vault Name</label>
        <input
          type="text"
          name="vaultName"
          value={formData.vaultName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          placeholder="e.g., Real Estate Fund 2024"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-medium mb-2">Principal (USDC)</label>
          <input
            type="number"
            name="principal"
            value={formData.principal}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="1000000"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Total Expected Interest (USDC)</label>
          <input
            type="number"
            name="totalExpectedInterest"
            value={formData.totalExpectedInterest}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="100000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-medium mb-2">Monthly Payment (USDC)</label>
          <input
            type="number"
            name="monthlyPayment"
            value={formData.monthlyPayment}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="20000"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Total Months</label>
          <input
            type="number"
            name="totalMonths"
            value={formData.totalMonths}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="60"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !publicKey}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded font-medium transition"
      >
        {loading ? 'Creating Vault...' : 'Create Vault'}
      </button>
    </form>
  );
};

export default VaultForm;
