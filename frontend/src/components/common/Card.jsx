import React from 'react';

const Card = ({ children, className = '', hover = false, glow = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm transition-all duration-200 ${
        hover ? 'hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${glow ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/10' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
