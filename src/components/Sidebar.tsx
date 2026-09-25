import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Bot,
  Trash2,
  ArrowLeftRight,
  Settings,
  Bell,
  HelpCircle,
  Headphones,
  LogOut,
  Sun,
  Moon,
  X,
  Sparkles,
  ChevronRight,
  Radio,
  ShoppingBag,
  CreditCard,
  Shield,
} from 'lucide-react';
import { PageTab, User } from '../types';

interface SidebarProps {
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  user: User | null;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  isDarkMode,
  onToggleTheme,
  onLogout,
  user,
  unreadCount = 2,
}) => {
  const [customLogoUrl, setCustomLogoUrl] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bot_matrix_platform_logo') || null;
    }
    return null;
  });

  const navItems: { label: PageTab; icon: React.ReactNode; badge?: string | number }[] = [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'My Bots', icon: <Bot className="w-5 h-5" />, badge: '404' },
    { label: 'Bot Store', icon: <ShoppingBag className="w-5 h-5" />, badge: 'Free' },
    { label: 'Broadcast Manager', icon: <Radio className="w-5 h-5" /> },
    { label: 'Recycle Bin', icon: <Trash2 className="w-5 h-5" />, badge: '2' },
    { label: 'Transfers', icon: <ArrowLeftRight className="w-5 h-5" />, badge: '89' },
    { label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { label: 'Notifications', icon: <Bell className="w-5 h-5" />, badge: unreadCount },
    { label: 'Help', icon: <HelpCircle className="w-5 h-5" /> },
    { label: 'Support', icon: <Headphones className="w-5 h-5" /> },
  ];

  const handleSelectTab = (tab: PageTab) => {
    setActiveTab(tab);
    // On mobile devices, close drawer after selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Responsive Sidebar Drawer */}
      <aside
        id="telebot-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/90 shadow-xl lg:shadow-none`}
      >
        {/* Top Header inside Sidebar: Platform info & requested Top-Right corner Theme Toggle */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            {customLogoUrl ? (
              <img
                src={customLogoUrl}
                alt="BOT MATRIX"
                className="w-9 h-9 rounded-xl object-contain shadow-md"
                onError={() => setCustomLogoUrl(null)}
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30 ring-1 ring-white/20">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-wider bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent font-mono uppercase drop-shadow-xs">
                  BOT MATRIX
                </span>
              </div>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest block font-mono">
                bot creator
              </span>
            </div>
          </div>

          {/* Theme Change Icon at TOP-RIGHT corner of Sidebar as explicitly requested */}
          <div className="flex items-center gap-1">
            <motion.button
              id="sidebar-theme-toggle-btn"
              type="button"
              onClick={onToggleTheme}
              whileTap={{ scale: 0.88, rotate: 180 }}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 transition-colors cursor-pointer"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </motion.button>

            {/* Close button for mobile screens */}
            <button
              id="sidebar-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Menu Navigation
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                id={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => handleSelectTab(item.label)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Cluster status & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2 shrink-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/25 dark:border-emerald-500/30 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                  All systems operational
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                29ms
              </span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 font-mono font-semibold tracking-tight">
              Fri, 18 Sep 2026 01:20:23 UTC
            </p>
          </div>

          {/* Theme Mode Toggle Button */}
          <button
            id="sidebar-theme-toggle-btn"
            type="button"
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </button>

          <button
            id="sidebar-logout-btn"
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 border border-rose-300/80 dark:border-rose-900/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
