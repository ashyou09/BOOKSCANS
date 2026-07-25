'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, X, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const { loginAdmin } = useAppStore();
  const [username, setUsername] = useState('ashyou09');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'ashyou09' && (password === 'admin123' || password.length >= 4)) {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        loginAdmin();
        setSuccess(false);
        onClose();
      }, 600);
    } else {
      setError('Invalid admin credentials. Default password is "admin123"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-asura-card border border-slate-200 dark:border-asura-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-asura-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Admin Login</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unlock PDF Upload & Edit privileges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-asura-cardHover text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Admin Access Granted!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter admin password (default: admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500 transition"
                required
              />
              <KeyRound className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-glow-purple transition"
            >
              Authenticate Admin
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Demo credentials: Username: <code className="text-brand-400">ashyou09</code> | Password: <code className="text-brand-400">admin123</code>
          </p>
        </form>
      </div>
    </div>
  );
};
