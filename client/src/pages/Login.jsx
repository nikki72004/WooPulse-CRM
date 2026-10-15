import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, Lock, Mail, Store } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('admin@woopulse.local');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* 3D Ambient Glowing Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand/30 rounded-full blur-3xl pointer-events-none animate-pulseGlow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none animate-pulseGlow" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Brand Card */}
        <div className="glass-panel-dark p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand to-indigo-500 flex items-center justify-center shadow-pill-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">WooPulse CRM</h2>
              <p className="text-xs text-white/60 font-mono">WooCommerce Intelligence Atelier</p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Operator Sign In</h1>
            <p className="text-xs text-white/60 mt-1">
              Secure single-tenant administrative access for connected store management.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                  placeholder="admin@woopulse.local"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold tracking-wide transition-all shadow-pill-glow flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Quick Demo Store Login (One-Click)</span>
            </button>
            <p className="text-[11px] text-white/40 text-center mt-2.5">
              Instantly explores pre-populated WooCommerce orders & Action Console.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
