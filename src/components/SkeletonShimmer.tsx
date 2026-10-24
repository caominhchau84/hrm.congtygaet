import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const SkeletonShimmer: React.FC<SkeletonProps> = ({ className = 'h-6 w-full' }) => {
  return (
    <div
      className={`relative overflow-hidden bg-slate-200/80 dark:bg-slate-800 rounded-xl ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/50 dark:via-slate-700/50 to-transparent" />
    </div>
  );
};
