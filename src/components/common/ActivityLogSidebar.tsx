import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Package, 
  ShoppingCart, 
  Users, 
  Building2, 
  Bell, 
  Upload, 
  Target, 
  X, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { AuditLog } from '../../types';

interface ActivityLogSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
  onNavigateTab?: (tab: any) => void;
}

export const ActivityLogSidebar: React.FC<ActivityLogSidebarProps> = ({
  isOpen,
  onClose,
  logs,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  // Take the latest 10 activities
  const recentLogs = logs.slice(0, 10);

  const getActionBadgeColor = (action: string, module: string) => {
    const act = action.toLowerCase();
    const mod = module.toLowerCase();

    if (act.includes('approved') || act.includes('delivered')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (act.includes('rejected') || act.includes('deleted') || act.includes('blocked')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (act.includes('stock') || act.includes('adjusted')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (act.includes('added') || act.includes('created') || act.includes('uploaded')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    }
    if (mod.includes('orders')) {
      return 'bg-blue-50 text-[#005B96] border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getModuleIcon = (module: string) => {
    const mod = module.toLowerCase();
    if (mod.includes('order')) return <ShoppingCart className="w-3.5 h-3.5" />;
    if (mod.includes('product') || mod.includes('stock')) return <Package className="w-3.5 h-3.5" />;
    if (mod.includes('user') || mod.includes('employee')) return <Users className="w-3.5 h-3.5" />;
    if (mod.includes('distributor') || mod.includes('stockist')) return <Building2 className="w-3.5 h-3.5" />;
    if (mod.includes('target')) return <Target className="w-3.5 h-3.5" />;
    if (mod.includes('notification')) return <Bell className="w-3.5 h-3.5" />;
    if (mod.includes('upload')) return <Upload className="w-3.5 h-3.5" />;
    return <Activity className="w-3.5 h-3.5" />;
  };

  const formatRelativeTime = (timestampStr: string) => {
    try {
      const now = new Date().getTime();
      const past = new Date(timestampStr).getTime();
      const diffSec = Math.floor((now - past) / 1000);

      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return new Date(timestampStr).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestampStr;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <aside 
        id="activity-log-sidebar"
        className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#005B96] rounded-lg border border-blue-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">Real-Time Activity Log</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500">Last 10 operational actions & audits</p>
            </div>
          </div>

          <button
            id="close-activity-sidebar-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close activity log"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-slate-100">
          {recentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <Clock className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No actions recorded yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                As users approve orders, update stock, or modify accounts, real-time events will stream here.
              </p>
            </div>
          ) : (
            recentLogs.map((log, idx) => (
              <div 
                key={log.id || `act-log-${idx}`}
                className="pt-3 first:pt-0 group hover:bg-slate-50/80 -mx-2 px-2 py-2 rounded-xl transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${getActionBadgeColor(log.action, log.module)}`}>
                      {getModuleIcon(log.module)}
                      <span>{log.action}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {log.module}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    {formatRelativeTime(log.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {log.details}
                </p>

                <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-slate-400 border-t border-slate-50">
                  <span className="flex items-center gap-1 font-medium text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#005B96]" />
                    By {log.performedBy || 'Super Admin'}
                  </span>
                  {log.ipAddress && (
                    <span className="font-mono text-[10px] text-slate-400">
                      IP: {log.ipAddress}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Showing {recentLogs.length} of {logs.length} logged actions
          </span>
          {onNavigateTab && (
            <button
              onClick={() => {
                onNavigateTab('reports');
                onClose();
              }}
              className="font-bold text-[#005B96] hover:underline"
            >
              Full Audit Logs &rarr;
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
