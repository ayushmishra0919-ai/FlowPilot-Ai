import React from 'react';

const Badge = ({ variant = 'default', children, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const variantClasses = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    // Intent specific
    customer_support: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    lead: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    complaint: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    sales: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    internal_request: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    notification: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    general: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    // Priority specific
    low: 'bg-slate-800 text-slate-400 border-slate-700',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    urgent: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse',
    // Status
    COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    FAILED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    PROCESSING: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    RECEIVED: 'bg-slate-700 text-slate-300 border-slate-600',
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    paused: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const selectedVariant = variantClasses[variant] || variantClasses.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all ${sizeClasses[size]} ${selectedVariant} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
