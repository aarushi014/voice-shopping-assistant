import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'suggestions';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 3,
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (type === 'suggestions') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
        {items.map((_, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 animate-pulse"
          >
            <div className="flex-1 space-y-2">
              <div className="h-3 w-16 bg-slate-800 rounded"></div>
              <div className="h-4 w-28 bg-slate-700 rounded"></div>
              <div className="h-2.5 w-36 bg-slate-800 rounded"></div>
            </div>
            <div className="h-7 w-14 bg-slate-800 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((_, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 animate-pulse"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-5 h-5 rounded bg-slate-800"></div>
              <div className="h-4 w-32 bg-slate-700 rounded"></div>
            </div>
            <div className="h-7 w-20 bg-slate-800 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {items.map((_, idx) => (
        <div
          key={idx}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse space-y-3"
        >
          <div className="h-4 w-20 bg-slate-800 rounded"></div>
          <div className="h-5 w-36 bg-slate-700 rounded"></div>
          <div className="h-4 w-24 bg-slate-800 rounded"></div>
        </div>
      ))}
    </div>
  );
};
