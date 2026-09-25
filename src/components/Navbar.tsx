import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Bot,
  Search,
  Bell,
  RefreshCw,
  Check,
  ExternalLink,
  Shield,
  Activity,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { PageTab, NotificationItem, User } from '../types';

interface NavbarProps {
  activeTab: PageTab;
  subTitle?: string | null;
  onToggleSidebar: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  user: User | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  subTitle,
  onToggleSidebar,
  onRefreshData,
  isRefreshing,
  searchQuery,
  setSearchQuery,
  notifications,
  onMarkNotificationAsRead,
  user,
  isDarkMode,
  onToggleTheme,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bot_matrix_platform_logo') || null;
    }
    return null;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* LEFT: Sidebar Toggle Icon, Platform Logo, Platform Name */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle Icon Button */}
        <motion.button
          id="navbar-sidebar-toggle-btn"
          type="button"
          onClick={onToggleSidebar}
          whileTap={{ scale: 0.92 }}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        {/* Platform Logo & Platform Name */}
        <div className="flex items-center gap-2.5">
          {customLogoUrl ? (
            <img
              src={customLogoUrl}
              alt="BOT MATRIX"
              className="w-8 h-8 rounded-xl object-contain shadow-md"
              onError={() => setCustomLogoUrl(null)}
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-1 ring-white/20">
              <Bot className="w-4 h-4" />
            </div>
          )}
          <span className="font-black text-base sm:text-lg tracking-wider bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent font-mono uppercase drop-shadow-xs hidden sm:inline-block">
            BOT MATRIX
          </span>
        </div>
      </div>

      {/* CENTER: Name of the current active page */}
      <div className="flex items-center justify-center">
        <div className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/80 flex items-center gap-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide truncate max-w-[200px] sm:max-w-[320px]">
            {subTitle || activeTab}
          </h2>
        </div>
      </div>

      {/* RIGHT: Notifications, Theme Switcher, Real-time Refresh Icon */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Icon with Badge & Popover */}
        <div className="relative">
          <motion.button
            id="navbar-notifications-btn"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            whileTap={{ scale: 0.92 }}
            className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-full mt-0 sm:mt-2 w-auto sm:w-96 rounded-2xl glass-panel shadow-2xl border border-slate-200/90 dark:border-slate-800 p-4 z-50"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Notifications
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                    {unreadCount} Unread
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800/60 my-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationAsRead(n.id)}
                      className={`py-2.5 px-2 rounded-xl transition-colors cursor-pointer ${
                        !n.read
                          ? 'bg-blue-50 dark:bg-blue-950/40'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {n.title}
                        </p>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 line-clamp-2 font-medium">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <button
                    onClick={() => {
                      notifications.forEach((n) => onMarkNotificationAsRead(n.id));
                    }}
                    className="text-blue-700 dark:text-blue-400 font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-semibold"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle (Light / Dark mode) */}
        <motion.button
          id="navbar-theme-toggle-btn"
          type="button"
          onClick={onToggleTheme}
          whileTap={{ scale: 0.88 }}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </motion.button>

        {/* Real-time Refresh Icon at Top-Right */}
        <motion.button
          id="navbar-refresh-btn"
          type="button"
          onClick={onRefreshData}
          whileTap={{ scale: 0.88 }}
          className={`p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            isRefreshing ? 'text-blue-600 dark:text-blue-400' : ''
          }`}
          title="Refresh real-time bot data"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </motion.button>
      </div>
    </header>
  );
};
