import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Zap, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Card from '../components/common/Card';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back to FlowPilot AI!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('demo@flowpilot.ai');
    setPassword('password123');
    setLoading(true);
    try {
      await login('demo@flowpilot.ai', 'password123');
      toast.success('Logged in with Demo Administrator Account.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Could not authenticate demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-2">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in to manage workflows, monitor executions, and access live telemetry.
          </p>
        </div>

        <Card className="space-y-6">
          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>⚡ Instant Demo Login (1-Click)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
              Or sign in with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
