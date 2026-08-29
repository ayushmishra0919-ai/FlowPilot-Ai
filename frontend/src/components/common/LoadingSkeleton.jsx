import React from 'react';

export const SkeletonLine = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-slate-800 animate-pulse rounded ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-slate-800 rounded w-1/3" />
      <div className="h-6 w-6 bg-slate-800 rounded-full" />
    </div>
    <div className="h-8 bg-slate-800 rounded w-1/2" />
    <div className="h-3 bg-slate-800 rounded w-2/3" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden animate-pulse">
    <div className="p-4 border-b border-slate-800 bg-slate-800/30">
      <div className="h-4 bg-slate-800 rounded w-1/4" />
    </div>
    <div className="divide-y divide-slate-800">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <div className="h-4 bg-slate-800 rounded w-1/6" />
          <div className="h-4 bg-slate-800 rounded w-2/5" />
          <div className="h-4 bg-slate-800 rounded w-1/6" />
          <div className="h-4 bg-slate-800 rounded w-1/6" />
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonCard;
