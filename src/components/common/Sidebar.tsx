import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Building2, 
  Target, 
  Bell, 
  UploadCloud, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronRight,
  Database,
  ShieldCheck,
  X
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../services/authContext';

export type NavItemKey = 
  | 'dashboard' 
  | 'products' 
  | 'orders' 
  | 'users' 
  | 'distributors' 
  | 'targets' 
  | 'notifications' 
  | 'bulk-upload' 
  | 'reports' 
  | 'settings';

interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isFirebaseActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingOrdersCount = 0,
  lowStockCount = 0,
  isOpenMobile,
  onCloseMobile,
  isFirebaseActive = true,
}) => {
  const { logout, user } = useAuth();

  const navItems: { key: NavItemKey; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      key: 'products',
      label: 'Products',
      icon: <Package className="w-5 h-5" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      key: 'users',
      label: 'Employees / Users',
      icon: <Users className="w-5 h-5" />,
    },
    {
      key: 'distributors',
      label: 'Distributors',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      key: 'targets',
      label: 'Targets & Incentives',
      icon: <Target className="w-5 h-5" />,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      key: 'bulk-upload',
      label: 'Bulk CSV Upload',
      icon: <UploadCloud className="w-5 h-5" />,
    },
    {
      key: 'reports',
      label: 'Reports & Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleNavClick = (key: NavItemKey) => {
    onSelectTab(key);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-68 lg:w-68 bg-[#09223c] text-slate-100 flex flex-col border-r border-[#153457] shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:translate-x-0 lg:z-auto shrink-0 h-screen overflow-hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4.5 border-b border-[#153457] flex items-center justify-between bg-[#06182c]">
          <Logo size="md" theme="dark" />
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database & Cloud status indicator */}
        <div className="px-4 py-2.5 bg-[#0b2b4d]/60 border-b border-[#153457] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Firestore Sync:</span>
          </div>
          <span className="inline-flex items-center gap-1 font-semibold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Connected
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Management
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                id={`nav-item-${item.key}`}
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-[#005B96] text-white font-semibold shadow-xs ring-1 ring-cyan-400/30'
                    : 'text-slate-300 hover:bg-[#102d4f] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        item.badgeColor || 'bg-cyan-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-cyan-300" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Admin User Info & Logout */}
        <div className="p-3 border-t border-[#153457] bg-[#06182c]">
          <div className="p-2.5 rounded-lg bg-[#0e2c4d] flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#005B96] to-cyan-500 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs ring-1 ring-cyan-400/40">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.displayName || 'Super Admin'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-cyan-300">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span className="capitalize">{user?.role ? user.role.replace('_', ' ') : 'Super Admin'}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            id="sidebar-logout-btn"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-300 hover:text-rose-300 bg-[#09223c] hover:bg-rose-950/40 border border-slate-700/60 hover:border-rose-800/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
