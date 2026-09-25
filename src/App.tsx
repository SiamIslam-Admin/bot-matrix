import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MyBotsView } from './components/MyBotsView';
import { BotStudioView } from './components/BotStudioView';
import { BroadcastView } from './components/BroadcastView';
import { BotStoreView } from './components/BotStoreView';
import {
  RecycleBinView,
  TransfersView,
  SettingsView,
  HelpSupportView,
} from './components/OtherViews';
import {
  initialBots,
  initialRecycleBinBots,
  initialActivityData,
  initialNotifications,
  initialBroadcasts,
} from './data/mockData';
import { User, PageTab, BotItem, BotStatus, BroadcastItem, StoreBot } from './types';
import { CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import {
  DashboardSkeleton,
  BotGridSkeleton,
  BotStoreSkeleton,
  TableListSkeleton,
  GenericPageSkeleton,
} from './components/SkeletonScreen';

export default function App() {
  // Theme state: defaults to false (clean white grid mode as requested), supports dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('telebot_theme') === 'dark';
    }
    return false;
  });

  // User auth state: starts at Auth view or loaded from storage
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('telebot_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<PageTab>('Dashboard');

  // Selected bot ID for Bot Studio editor view
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);

  // Mobile/desktop sidebar drawer toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Bot clusters and telemetry state
  const [bots, setBots] = useState<BotItem[]>(initialBots);
  const selectedBot = bots.find((b) => b.id === selectedBotId);
  const [recycleBots, setRecycleBots] = useState<BotItem[]>(initialRecycleBinBots);
  const [activityData, setActivityData] = useState(initialActivityData);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>(initialBroadcasts);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('Just now');
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  // Tab transition loading skeleton state
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  // Animation settings state (respects "Disable Animations" setting)
  const [disableAnimations, setDisableAnimations] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('telebot_disable_animations') === 'true';
    }
    return false;
  });

  // Listen for dynamic animation settings changes
  useEffect(() => {
    const handleAnimChange = (e: any) => {
      if (e.detail !== undefined) {
        setDisableAnimations(Boolean(e.detail));
      }
    };
    const handleSettingsUpdate = (e: any) => {
      if (e.detail && e.detail.disableAnimations !== undefined) {
        setDisableAnimations(Boolean(e.detail.disableAnimations));
      }
    };
    window.addEventListener('telebot_animation_setting_changed', handleAnimChange);
    window.addEventListener('telebot_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('telebot_animation_setting_changed', handleAnimChange);
      window.removeEventListener('telebot_settings_updated', handleSettingsUpdate);
    };
  }, []);

  // Smooth tab switching with simulated skeleton loading for heavy views
  const handleTabChange = (nextTab: PageTab) => {
    if (nextTab === activeTab && !selectedBotId) return;
    setIsLoadingTab(true);
    setActiveTab(nextTab);
    if (nextTab !== 'My Bots') {
      setSelectedBotId(null);
    }
    setTimeout(() => {
      setIsLoadingTab(false);
    }, 380);
  };

  // Sync dark mode class with html root element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('telebot_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('telebot_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist user session
  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem('telebot_user', JSON.stringify(authenticatedUser));
    setActiveTab('Dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('telebot_user');
  };

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Real-time data refresh handler
  const handleRefreshData = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    setTimeout(() => {
      // Slightly fluctuate data to simulate real-time live ingestion
      setActivityData((prev) =>
        prev.map((item) => ({
          ...item,
          users: Math.min(3.0, Math.max(0.1, Number((item.users + (Math.random() * 0.2 - 0.1)).toFixed(2)))),
          commands: Math.max(1, item.commands + Math.floor(Math.random() * 5 - 2)),
        }))
      );

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastUpdatedTime(timeStr);
      setIsRefreshing(false);

      setRefreshToast('Real-time bot telemetry synced (Response time: 29ms)');
      setTimeout(() => setRefreshToast(null), 3500);
    }, 800);
  };

  // Bot management actions
  const handleToggleBotStatus = (botId: string) => {
    setBots((prev) =>
      prev.map((b) => {
        if (b.id === botId) {
          const nextStatus: BotStatus = b.status === 'working' ? 'stopped' : 'working';
          return { ...b, status: nextStatus };
        }
        return b;
      })
    );
  };

  const handleMoveToRecycleBin = (botId: string) => {
    const botToMove = bots.find((b) => b.id === botId);
    if (!botToMove) return;

    setBots((prev) => prev.filter((b) => b.id !== botId));
    setRecycleBots((prev) => [{ ...botToMove, inRecycleBin: true, status: 'stopped' }, ...prev]);
    if (selectedBotId === botId) {
      setSelectedBotId(null);
    }

    setRefreshToast(`Moved ${botToMove.name} to Recycle Bin`);
    setTimeout(() => setRefreshToast(null), 3000);
  };

  const handleRestoreBot = (botId: string) => {
    const botToRestore = recycleBots.find((b) => b.id === botId);
    if (!botToRestore) return;

    setRecycleBots((prev) => prev.filter((b) => b.id !== botId));
    setBots((prev) => [{ ...botToRestore, inRecycleBin: false, status: 'working' }, ...prev]);

    setRefreshToast(`Restored ${botToRestore.name} to active bots`);
    setTimeout(() => setRefreshToast(null), 3000);
  };

  const handlePermanentlyDelete = (botId: string) => {
    setRecycleBots((prev) => prev.filter((b) => b.id !== botId));
  };

  const handleEmptyRecycleBin = () => {
    setRecycleBots([]);
  };

  const handleCreateBot = (newBotData: Partial<BotItem>) => {
    const randomNumericId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const created: BotItem = {
      id: newBotData.id || randomNumericId,
      botNumericId: newBotData.botNumericId || randomNumericId,
      name: newBotData.name || 'New Bot',
      username: newBotData.username || '@MyBot',
      status: 'working',
      activeUsers: 1,
      totalCommands: 59,
      category: newBotData.category || 'Utility & Tools',
      folder: newBotData.folder || 'Main Bots',
      lastActive: 'Just now',
      uptime: '100%',
      version: 'v1.0.0',
      token: newBotData.token,
      isPinned: false,
    };
    setBots((prev) => [created, ...prev]);
    setRefreshToast(`Deployed ${created.name} to Telegram Cluster!`);
    setTimeout(() => setRefreshToast(null), 3500);
  };

  const handleUpdateBot = (updatedBot: BotItem) => {
    setBots((prev) => prev.map((b) => (b.id === updatedBot.id ? updatedBot : b)));
  };

  const handleCloneBot = (originalBot: BotItem) => {
    const cloneNumericId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const cleanUsername = originalBot.username.replace('@', '');
    const cloned: BotItem = {
      ...originalBot,
      id: cloneNumericId,
      botNumericId: cloneNumericId,
      name: `${originalBot.name} (Clone)`,
      username: `@${cleanUsername}_clone`,
      status: 'cloned',
      isPinned: false,
      lastActive: 'Just now',
      uptime: '00:00:00',
    };
    setBots((prev) => [cloned, ...prev]);
    setSelectedBotId(cloned.id);
    setRefreshToast(`Successfully cloned bot as ${cloned.username}`);
    setTimeout(() => setRefreshToast(null), 3500);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDeployStoreBot = (storeBot: StoreBot) => {
    const randomNumericId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const created: BotItem = {
      id: randomNumericId,
      botNumericId: randomNumericId,
      name: storeBot.name,
      username: storeBot.botPayload.username || `@${storeBot.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_bot`,
      status: 'working',
      activeUsers: 1,
      totalCommands: storeBot.botPayload.totalCommands || 12,
      category: storeBot.category,
      folder: 'Store Clones',
      lastActive: 'Just now',
      uptime: '100%',
      version: storeBot.version || 'v1.0.0',
      isPinned: false,
      commands: storeBot.botPayload.commands || [],
      ...storeBot.botPayload,
    };
    setBots((prev) => [created, ...prev]);
    // Stay in Bot Store and let user see clone success confirmation modal
    setRefreshToast(`Successfully cloned "${storeBot.name}"!`);
    setTimeout(() => setRefreshToast(null), 3500);
  };

  // If user is not authenticated, render Login/Register Page with White Grid Background
  if (!user) {
    return (
      <AuthModal
        onSuccess={handleAuthSuccess}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {refreshToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-white/10 dark:border-slate-800"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{refreshToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive Sidebar (Mobile Drawer & Desktop Fixed) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        user={user}
        unreadCount={notifications.filter((n) => !n.read).length}
      />

      {/* Main Content Area (Offset by lg:pl-72 on Desktop) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen">
        {/* Top Header Navbar */}
        <Navbar
          activeTab={activeTab}
          subTitle={
            activeTab === 'My Bots' && selectedBot
              ? `${selectedBot.name} (Bot Studio)`
              : undefined
          }
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onRefreshData={handleRefreshData}
          isRefreshing={isRefreshing}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          user={user}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />

        {/* Page Content View with Grid Background */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto bg-grid-pattern">
          <AnimatePresence mode="wait">
            <motion.div
              key={
                activeTab +
                (selectedBotId ? `-${selectedBotId}` : '') +
                (isLoadingTab || isRefreshing ? '-skeleton' : '')
              }
              initial={disableAnimations ? false : { opacity: 0, y: 14, scale: 0.995 }}
              animate={disableAnimations ? false : { opacity: 1, y: 0, scale: 1 }}
              exit={disableAnimations ? undefined : { opacity: 0, y: -10, scale: 0.995 }}
              transition={
                disableAnimations ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
              }
            >
              {isLoadingTab || isRefreshing ? (
                activeTab === 'Dashboard' ? (
                  <DashboardSkeleton />
                ) : activeTab === 'My Bots' && !selectedBotId ? (
                  <BotGridSkeleton />
                ) : activeTab === 'Bot Store' ? (
                  <BotStoreSkeleton />
                ) : activeTab === 'Transfers' ? (
                  <TableListSkeleton rows={5} />
                ) : activeTab === 'Recycle Bin' ? (
                  <TableListSkeleton rows={4} />
                ) : activeTab === 'Notifications' ? (
                  <TableListSkeleton rows={5} />
                ) : (
                  <GenericPageSkeleton />
                )
              ) : (
                <>
              {activeTab === 'Dashboard' && (
                <DashboardView
                  bots={bots}
                  activityData={activityData}
                  lastUpdatedTime={lastUpdatedTime}
                  onNavigateToBots={() => {
                    setSelectedBotId(null);
                    setActiveTab('My Bots');
                  }}
                  onCreateBotClick={() => {
                    setSelectedBotId(null);
                    setActiveTab('My Bots');
                  }}
                  onSelectBot={(bot) => {
                    setSelectedBotId(bot.id);
                    setActiveTab('My Bots');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                />
              )}

              {activeTab === 'My Bots' && (
                selectedBot ? (
                  <BotStudioView
                    bot={selectedBot}
                    onBack={() => {
                      setSelectedBotId(null);
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }}
                    onUpdateBot={handleUpdateBot}
                    onDeleteBot={(id) => {
                      handleMoveToRecycleBin(id);
                      setSelectedBotId(null);
                    }}
                    onCloneBot={handleCloneBot}
                  />
                ) : (
                  <MyBotsView
                    bots={bots}
                    onToggleStatus={handleToggleBotStatus}
                    onMoveToRecycleBin={handleMoveToRecycleBin}
                    onCreateBot={handleCreateBot}
                    searchQuery={searchQuery}
                    onOpenEditor={(bot) => {
                      setSelectedBotId(bot.id);
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }}
                    onUpdateBot={handleUpdateBot}
                  />
                )
              )}

              {activeTab === 'Broadcast Manager' && (
                <BroadcastView
                  bots={bots}
                  broadcasts={broadcasts}
                  onSendBroadcast={(newBc) => {
                    setBroadcasts([newBc, ...broadcasts]);
                    setRefreshToast(`Broadcast queued: ${newBc.title}`);
                    setTimeout(() => setRefreshToast(null), 3000);
                  }}
                  onDeleteBroadcast={(id) => {
                    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
                  }}
                  onUpdateBroadcast={(updatedBc) => {
                    setBroadcasts((prev) => prev.map((b) => b.id === updatedBc.id ? updatedBc : b));
                  }}
                />
              )}

              {activeTab === 'Recycle Bin' && (
                <RecycleBinView
                  recycleBots={recycleBots}
                  onRestoreBot={handleRestoreBot}
                  onPermanentlyDelete={handlePermanentlyDelete}
                  onEmptyRecycleBin={handleEmptyRecycleBin}
                />
              )}

              {activeTab === 'Bot Store' && (
                <BotStoreView
                  onDeployStoreBot={handleDeployStoreBot}
                  onShowToast={(msg) => {
                    setRefreshToast(msg);
                    setTimeout(() => setRefreshToast(null), 3000);
                  }}
                  onNavigateToMyBots={() => {
                    setSelectedBotId(null);
                    setActiveTab('My Bots');
                  }}
                />
              )}

              {activeTab === 'Transfers' && <TransfersView />}

              {activeTab === 'Settings' && <SettingsView user={user} />}

              {activeTab === 'Notifications' && (
                <div className="space-y-6 pb-12 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        All Notifications
                      </h1>
                      <p className="text-xs text-slate-500 mt-1">
                        Recent bot system events, webhooks, and alerts
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                      }
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkNotificationAsRead(n.id)}
                        className={`p-4 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                          !n.read
                            ? 'bg-blue-50/50 dark:bg-blue-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {n.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            {n.message}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {n.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Help' && <HelpSupportView />}

              {activeTab === 'Support' && <HelpSupportView />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
