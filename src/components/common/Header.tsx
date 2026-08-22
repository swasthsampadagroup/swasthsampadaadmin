import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  RotateCw, 
  ShieldCheck, 
  LogOut, 
  User, 
  Settings, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '../../services/authContext';
import { AppNotification } from '../../types';

interface HeaderProps {
  currentTab: string;
  onToggleSidebar: () => void;
  notifications: AppNotification[];
  onRefreshData: () => Promise<void>;
  onNavigateTab: (tab: any) => void;
  onOpenActivityLog?: () => void;
  activityCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onToggleSidebar,
  notifications,
  onRefreshData,
  onNavigateTab,
  onOpenActivityLog,
  activityCount = 0,
}) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'products': return 'Products & Inventory Management';
      case 'orders': return 'Sales Orders & Approvals';
      case 'users': return 'Employee & Staff Management';
      case 'distributors': return 'Distributor Network';
      case 'targets': return 'Targets & Performance Incentives';
      case 'notifications': return 'Notification Broadcast Center';
      case 'bulk-upload': return 'Bulk CSV Data Upload';
      case 'reports': return 'Business Reports & Analytics';
      case 'settings': return 'Admin & System Settings';
      default: return 'Admin Console';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Swasth Sampada</span>
              <span>/</span>
              <span className="text-[#005B96] font-semibold capitalize">
                {currentTab.replace('-', ' ')}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-none mt-0.5">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right Section: Sync, Activity Log, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Real-time Activity Log Button */}
          {onOpenActivityLog && (
            <button
              id="header-activity-log-btn"
              onClick={onOpenActivityLog}
              title="Real-Time Activity Log"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#005B96] bg-blue-50/80 hover:bg-blue-100/90 rounded-lg border border-blue-200 transition-all active:scale-95"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Activity Log</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          )}

          {/* Quick Refresh Firestore button */}
          <button
            id="header-refresh-data-btn"
            onClick={handleRefresh}
            title="Refresh & Sync Data"
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-all active:scale-95"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#005B96] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">Notifications</span>
                    <span className="text-[11px] bg-blue-100 text-[#005B96] px-2 py-0.5 rounded-full font-semibold">
                      {notifications.length} Total
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onNavigateTab('notifications');
                      setShowNotifications(false);
                    }}
                    className="text-xs text-[#005B96] hover:underline font-medium"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications available
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span className="truncate">{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(n.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-2">{n.message}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-medium text-[#005B96] capitalize">
                            To: {n.targetAudience}
                          </span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {n.deliveryStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <button
                    onClick={() => {
                      onNavigateTab('notifications');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-semibold text-[#005B96] hover:text-[#004080]"
                  >
                    + Compose New Broadcast Notification
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              id="header-user-profile-btn"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#005B96] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.displayName || 'Super Admin'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium leading-none">
                  {user?.email || 'admin@swasthsampada.com'}
                </p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 bg-slate-50 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-800 truncate">{user?.displayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold bg-blue-100 text-[#005B96] px-2 py-0.5 rounded">
                    Role: {user?.role ? user.role.replace('_', ' ').toUpperCase() : 'SUPER ADMIN'}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigateTab('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings & Firebase</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('reports');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Sales & Performance Reports</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 p-1">
                  <button
                    onClick={() => logout()}
                    className="w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
