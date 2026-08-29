import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, PlayCircle, LogOut, User, ShieldCheck, Activity } from 'lucide-react';
import Badge from './Badge';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                FlowPilot<span className="text-indigo-500">.AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold tracking-wider text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                Enterprise
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Status */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Pipeline Engine: <strong>Active</strong></span>
          </div>
          <Badge variant="primary" size="sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            Demo Mode Active
          </Badge>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/simulator"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Request Simulator</span>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-200">{user?.name || 'Admin'}</span>
                  <span className="text-[10px] text-slate-400">{user?.email || 'demo@flowpilot.ai'}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
