import React from 'react';
import { OrderStatus, UserStatus, StockStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | UserStatus | StockStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      // Positive states
      case 'Approved':
      case 'Active':
      case 'In Stock':
      case 'Achieved':
      case 'Sent':
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';

      // Warning / Pending states
      case 'Pending':
      case 'In Progress':
      case 'Low Stock':
      case 'Scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';

      // Critical / Negative states
      case 'Rejected':
      case 'Cancelled':
      case 'Out of Stock':
      case 'Blocked':
      case 'Inactive':
      case 'Missed':
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';

      // Neutral / In-transit states
      case 'Dispatched':
        return 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/20';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'Approved':
      case 'Active':
      case 'In Stock':
      case 'Achieved':
      case 'Sent':
      case 'Delivered':
        return 'bg-emerald-500';

      case 'Pending':
      case 'In Progress':
      case 'Low Stock':
      case 'Scheduled':
        return 'bg-amber-500 animate-pulse';

      case 'Rejected':
      case 'Cancelled':
      case 'Out of Stock':
      case 'Blocked':
      case 'Inactive':
      case 'Missed':
      case 'Failed':
        return 'bg-rose-500';

      case 'Dispatched':
        return 'bg-sky-500';

      default:
        return 'bg-slate-400';
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[11px]' 
    : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs select-none ${sizeClasses} ${getBadgeStyle()} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      <span className="truncate">{status}</span>
    </span>
  );
};
