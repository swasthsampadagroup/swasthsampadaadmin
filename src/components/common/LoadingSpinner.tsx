import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label,
  text,
  size = 'md',
  fullPage = false,
  color = '#005B96',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const displayText = text || label || 'Loading data...';

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div
        className={`${sizeClasses[size]} border-t-transparent rounded-full animate-spin`}
        style={{ borderColor: `${color} transparent transparent transparent` }}
      />
      {displayText && <p className="text-xs font-semibold text-slate-600 animate-pulse">{displayText}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
