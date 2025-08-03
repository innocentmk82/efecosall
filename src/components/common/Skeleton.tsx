import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = true
}) => {
  return (
    <div
      className={`
        animate-pulse bg-gray-200
        ${width} ${height}
        ${rounded ? 'rounded' : ''}
        ${className}
      `}
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <Skeleton width="w-12" height="h-12" />
      <div className="flex-1">
        <Skeleton width="w-3/4" height="h-5" className="mb-2" />
        <Skeleton width="w-1/2" height="h-4" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton height="h-4" />
      <Skeleton width="w-5/6" height="h-4" />
      <Skeleton width="w-4/5" height="h-4" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <Skeleton width="w-1/3" height="h-6" />
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} width="w-full" height="h-4" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;