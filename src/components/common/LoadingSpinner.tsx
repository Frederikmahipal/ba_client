import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );
};

export default LoadingSpinner; 