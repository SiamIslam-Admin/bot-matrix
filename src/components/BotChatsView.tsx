import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Users,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  MoreVertical,
  Download,
  FileText,
  User,
  X,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { BotItem, BotChatUser } from '../types';
import { AudienceListSkeleton } from './SkeletonScreen';
import { apiService } from '../services/apiService';

interface BotChatsViewProps {
  bot: BotItem;
  onUpdateBot: (updated: BotItem) => void;
  onShowToast: (msg: string) => void;
}

const fallbackDefaultUsers: BotChatUser[] = [
  {
    id: 'usr-1',
    telegramId: '61829103',
    name: 'Farhan Ahmed',
    username: '@farhan_bd',
    avatarColor: 'from-blue-600 to-indigo-600',
    lastActive: 'Today, 17:42',
    lastMessage: 'Can you please verify my balance transaction of 0.05 BNB?',
    isBlocked: false,
    messagesCount: 24,
  },
  {
    id: 'usr-2',
    telegramId: '19827364',
    name: 'Rahim Chowdhury',
    username: '@rahim_dev',
    avatarColor: 'from-emerald-600 to-teal-600',
    lastActive: 'Today, 14:15',
    lastMessage: '/start - Joined verification community',
    isBlocked: false,
    messagesCount: 9,
  },
  {
    id: 'usr-3',
    telegramId: '47281902',
    name: 'Alexandre Dupond',
    username: '@alex_dup',
    avatarColor: 'from-purple-600 to-pink-600',
    lastActive: 'Yesterday, 22:30',
    lastMessage: 'Payment received successfully, thank you bot admin!',
    isBlocked: false,
    messagesCount: 41,
  },
  {
    id: 'usr-4',
    telegramId: '58291043',
    name: 'Spam Bot Network',
    username: '@spammer_auto_99',
    avatarColor: 'from-rose-600 to-red-700',
    lastActive: '3 Sep, 11:05',
    lastMessage: 'Free claim airdrop link: http://scam-airdrop-telegram.org',
    isBlocked: true,
    messagesCount: 3,
  },
  {
    id: 'usr-5',
    telegramId: '91823719',
    name: 'Elena Rostova',
    username: '@elena_tg',
    avatarColor: 'from-amber-500 to-orange-600',
    lastActive: '4 Sep, 09:20',
    lastMessage: 'Hello, which command gives me daily earnings report?',
    isBlocked: false,
    messagesCount: 18,
  },
  {
    id: 'usr-6',
    telegramId: '38291047',
    name: 'Scam Phishing Bot',
    username: '@crypto_reward_airdrop',
    avatarColor: 'from-slate-600 to-slate-800',
    lastActive: '1 Sep, 19:12',
    lastMessage: 'WIN 5000 USDT IMMEDIATELY CLICK HERE',
    isBlocked: true,
    messagesCount: 1,
  },
];

// Helper to seed scalable high-volume audience records for pagination testing
const generateExpandedAudience = (baseUsers: BotChatUser[]): BotChatUser[] => {
  const sampleNames = [
    'Alexander Vance', 'Sophia Chen', 'Tariq Al-Mansoor', 'Kavita Patel', 'Mateo Silva',
    'Oliver Schmidt', 'Amara Okafor', 'Lucas Dubois', 'Yuki Tanaka', 'Hannah Abbott',
    'Liam O\'Connor', 'Zayn Malik', 'Aria Montgomery', 'Carlos Mendoza', 'Nadia Ivanova',
    'Benjamin Cole', 'Chloe Martin', 'David Miller', 'Fatima Zahra', 'Gabriel Santos',
    'Hassan Ali', 'Isabella Rossi', 'James Wilson', 'Klara Novak', 'Leo Johansson'
  ];
  const sampleMessages = [
    '/start - Initialized account on Telegram',
    'Can you please confirm my pending task payout?',
    'Payment received successfully, thank you bot!',
    'Hello, which command shows the VIP status list?',
    'How do I claim the referral milestone bonus?',
    'When is the next broadcast snapshot scheduled?',
    'Thanks for the fast reply! Everything is working now.',
    'Is TON withdrawal enabled right now?',
    '/help - need command list for bot operations',
    'Awesome Telegram bot setup, loving the speed.'
  ];
  const colorGradients = [
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-purple-600 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-600 to-blue-700',
    'from-rose-600 to-pink-600',
    'from-violet-600 to-purple-800'
  ];

  const pool: BotChatUser[] = [...baseUsers];
  
  // Seed up to 120 audience members across pages
  for (let i = pool.length + 1; i <= 120; i++) {
    const name = sampleNames[(i - 1) % sampleNames.length] + (i > 25 ? ` #${Math.floor(i / 10)}` : '');
    const cleanHandle = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const isBlocked = i % 9 === 0;
    pool.push({
      id: `usr-gen-${i}`,
      telegramId: (10000000 + (i * 789123) % 89999999).toString(),
      name,
      username: `@${cleanHandle}_${(i * 13) % 99}`,
      avatarColor: colorGradients[i % colorGradients.length],
      lastActive: i % 3 === 0 ? 'Today, ' + (10 + (i % 12)) + ':' + ((i * 7) % 59).toString().padStart(2, '0') : (i % 7 + 1) + ' Sep, 14:20',
      lastMessage: isBlocked ? 'Spam promotional URL flagged by security' : sampleMessages[i % sampleMessages.length],
      isBlocked,
      messagesCount: (i * 3) % 45 + 1,
    });
  }

  return pool;
};

export const BotChatsView: React.FC<BotChatsViewProps> = ({
  bot,
  onUpdateBot,
  onShowToast,
}) => {
  const [chatUsers, setChatUsers] = useState<BotChatUser[]>(() => {
    const base = bot.chats && bot.chats.length > 0 ? bot.chats : fallbackDefaultUsers;
    return generateExpandedAudience(base);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Active' | 'Blocked'>('All');
  const [selectedUser, setSelectedUser] = useState<BotChatUser | null>(null);
  const [quickReplyText, setQuickReplyText] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');
  const [isPageTransitioning, setIsPageTransitioning] = useState<boolean>(false);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'JSON' | 'CSV'>('JSON');
  const [exportCategory, setExportCategory] = useState<'All' | 'Active' | 'Blocked'>('All');

  // Toggle block / unblock for user
  const handleToggleBlock = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = chatUsers.find((u) => u.id === userId);
    if (!target) return;

    const nextBlockedState = !target.isBlocked;
    const updatedUsers = chatUsers.map((u) =>
      u.id === userId ? { ...u, isBlocked: nextBlockedState } : u
    );

    setChatUsers(updatedUsers);
    onUpdateBot({ ...bot, chats: updatedUsers });

    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, isBlocked: nextBlockedState });
    }

    onShowToast(
      nextBlockedState
        ? `Blocked ${target.name} (${target.username})`
        : `Unblocked ${target.name} (${target.username})`
    );
  };

  // Filter users based on search & block status
  const filteredUsers = useMemo(() => {
    return chatUsers.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.telegramId.includes(searchQuery) ||
        (u.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterType === 'Active') return !u.isBlocked;
      if (filterType === 'Blocked') return u.isBlocked;
      return true;
    });
  }, [chatUsers, searchQuery, filterType]);

  const totalFilteredCount = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFilteredCount);
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, startIndex, endIndex]);

  const handlePageChange = (targetPage: number) => {
    const valid = Math.min(Math.max(1, targetPage), totalPages);
    if (valid === safeCurrentPage) return;
    setIsPageTransitioning(true);
    setCurrentPage(valid);
    setTimeout(() => {
      setIsPageTransitioning(false);
    }, 220);
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput.trim(), 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      handlePageChange(p);
      setJumpPageInput('');
    } else {
      onShowToast(`Please enter a valid page number between 1 and ${totalPages}`);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setIsPageTransitioning(true);
    setPageSize(newSize);
    setCurrentPage(1);
    onShowToast(`Showing ${newSize} users per page`);
    setTimeout(() => {
      setIsPageTransitioning(false);
    }, 220);
  };

  const totalCount = chatUsers.length;
  const activeCount = chatUsers.filter((u) => !u.isBlocked).length;
  const blockedCount = chatUsers.filter((u) => u.isBlocked).length;

  const handleSendQuickReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReplyText.trim() || !selectedUser) return;
    onShowToast(`Direct reply sent to ${selectedUser.name} on Telegram`);
    setQuickReplyText('');
  };

  // Perform JSON or CSV export
  const handleExecuteExport = () => {
    const targetUsers = chatUsers.filter((u) => {
      if (exportCategory === 'Active') return !u.isBlocked;
      if (exportCategory === 'Blocked') return u.isBlocked;
      return true;
    });

    if (targetUsers.length === 0) {
      onShowToast(`No users found in category: ${exportCategory}`);
      return;
    }

    let fileContent = '';
    let mimeType = '';
    let fileName = `${bot.username.replace('@', '') || 'bot'}_users_${exportCategory.toLowerCase()}`;

    if (exportFormat === 'JSON') {
      fileContent = JSON.stringify(targetUsers, null, 2);
      mimeType = 'application/json';
      fileName += '.json';
    } else {
      // CSV format
      const headers = ['ID', 'TelegramID', 'Name', 'Username', 'Status', 'LastActive', 'MessagesCount', 'LastMessage'];
      const rows = targetUsers.map((u) => [
        u.id,
        u.telegramId,
        `"${u.name.replace(/"/g, '""')}"`,
        `"${u.username.replace(/"/g, '""')}"`,
        u.isBlocked ? 'Blocked' : 'Active',
        `"${u.lastActive}"`,
        u.messagesCount || 0,
        `"${(u.lastMessage || '').replace(/"/g, '""')}"`,
      ]);
      fileContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      fileName += '.csv';
    }

    // Trigger download
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExportModalOpen(false);
    onShowToast(`Exported ${targetUsers.length} users as ${exportFormat}!`);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="glass-panel p-5 rounded-3xl space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Bot Telegram Chats & Audience</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage user sessions, review Telegram messages, and export audience data in JSON or CSV.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export Button */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Users</span>
            </button>

            {/* Quick stats pills */}
            <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-900/40">
              Total: {totalCount}
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              Active: {activeCount}
            </span>
            <span className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900/40">
              Blocked: {blockedCount}
            </span>
          </div>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, username, or Telegram ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
            />
          </div>

          {/* Filter Pills: All, Active, Blocked */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 shrink-0">
            {(['All', 'Active', 'Blocked'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterType(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === tab
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab}
                {tab === 'All' && ` (${totalCount})`}
                {tab === 'Active' && ` (${activeCount})`}
                {tab === 'Blocked' && ` (${blockedCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout: User List + Optional Detail/Reply Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Users List Column */}
        <div className={selectedUser ? 'lg:col-span-2 space-y-3' : 'lg:col-span-3 space-y-3'}>
          {/* Quick Telemetry Bar above the list */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-900/40">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Total Filtered: {totalFilteredCount.toLocaleString()}</span>
              </span>
              <span>
                Showing {totalFilteredCount > 0 ? startIndex + 1 : 0}–{endIndex} of {totalFilteredCount.toLocaleString()}
              </span>
            </div>

            {/* Page Size Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Rows per page</span>
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
                {[10, 25, 50, 100].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handlePageSizeChange(sz)}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors ${
                      pageSize === sz
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl text-center space-y-2 border border-slate-200 dark:border-slate-800">
              <UserX className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Telegram users found
              </h3>
              <p className="text-xs text-slate-500">
                Try a different search query or change the status filter.
              </p>
            </div>
          ) : isPageTransitioning ? (
            <AudienceListSkeleton rows={Math.min(pageSize, 8)} />
          ) : (
            <div className="space-y-2.5">
              {paginatedUsers.map((usr) => {
                const isSelected = selectedUser?.id === usr.id;
                return (
                  <motion.div
                    key={usr.id}
                    layout
                    whileHover={{ scale: 1.004 }}
                    onClick={() => setSelectedUser(usr)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/30'
                        : usr.isBlocked
                        ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-blue-400'
                    }`}
                  >
                    {/* Left: User Telegram Profile Photo or Avatar */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-full bg-gradient-to-tr ${
                          usr.avatarColor || 'from-blue-600 to-indigo-600'
                        } text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm relative overflow-hidden border border-slate-200 dark:border-slate-700`}
                      >
                        {usr.photoUrl ? (
                          <img
                            src={usr.photoUrl}
                            alt={usr.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white/90" />
                        )}
                        {usr.isBlocked && (
                          <span
                            title="User is blocked"
                            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                          >
                            ✕
                          </span>
                        )}
                      </div>

                      {/* Name, Username, Date & Time, Message */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {usr.name}
                          </h4>
                          {usr.isBlocked ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                              Blocked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                              Active
                            </span>
                          )}
                        </div>

                        {/* Username below name */}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                            {usr.username}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-[11px] font-mono text-slate-500">
                            ID: {usr.telegramId}
                          </span>
                        </div>

                        {/* Date & Time below username */}
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{usr.lastActive}</span>
                          {usr.lastMessage && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="truncate max-w-[200px] sm:max-w-[340px] text-slate-600 dark:text-slate-300 italic font-medium">
                                "{usr.lastMessage}"
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Side: Block / Unblock Action Button */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={(e) => handleToggleBlock(usr.id, e)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          usr.isBlocked
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                            : 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}
                        title={usr.isBlocked ? 'Unblock user' : 'Block user'}
                      >
                        {usr.isBlocked ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Unblock</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            <span>Block</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://t.me/${usr.username.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                        title="Open chat on Telegram"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Advanced Pagination Toolbar */}
          {totalPages > 1 && (
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              {/* Left: Page range and navigation */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Windowed Page Numbers */}
                <div className="flex items-center gap-1 px-1">
                  {(() => {
                    const pages: (number | string)[] = [];
                    const maxButtons = 5;
                    let start = Math.max(1, safeCurrentPage - 2);
                    let end = Math.min(totalPages, start + maxButtons - 1);
                    if (end - start + 1 < maxButtons) {
                      start = Math.max(1, end - maxButtons + 1);
                    }

                    if (start > 1) {
                      pages.push(1);
                      if (start > 2) pages.push('...');
                    }
                    for (let p = start; p <= end; p++) {
                      pages.push(p);
                    }
                    if (end < totalPages) {
                      if (end < totalPages - 1) pages.push('...');
                      pages.push(totalPages);
                    }

                    return pages.map((item, idx) => {
                      if (typeof item === 'string') {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400 font-mono">
                            •••
                          </span>
                        );
                      }
                      const isCurrent = item === safeCurrentPage;
                      return (
                        <button
                          key={`page-${item}`}
                          type="button"
                          onClick={() => handlePageChange(item)}
                          className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    });
                  })()}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right: Direct Page Jump Input */}
              <form onSubmit={handleJumpToPage} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Jump to page</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  placeholder={`${safeCurrentPage}/${totalPages}`}
                  className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono text-center focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Go
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Selected User Details / Conversation Inspector Drawer */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 self-start"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                User Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="text-center space-y-2">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-tr ${
                  selectedUser.avatarColor || 'from-blue-600 to-indigo-600'
                } text-white flex items-center justify-center font-black text-xl mx-auto shadow-md border-2 border-slate-200 dark:border-slate-700 overflow-hidden`}
              >
                {selectedUser.photoUrl ? (
                  <img
                    src={selectedUser.photoUrl}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white/90" />
                )}
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {selectedUser.name}
              </h4>
              <p className="font-mono text-xs text-blue-600 dark:text-blue-400">
                {selectedUser.username}
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                Telegram ID {selectedUser.telegramId}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Status</span>
                <span className={`font-bold ${selectedUser.isBlocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Last Active</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {selectedUser.lastActive}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total Messages</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {selectedUser.messagesCount || 10}
                </span>
              </div>
            </div>

            {/* Block / Unblock in drawer */}
            <button
              type="button"
              onClick={(e) => handleToggleBlock(selectedUser.id, e)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedUser.isBlocked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {selectedUser.isBlocked ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Unblock This User</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>Block This User</span>
                </>
              )}
            </button>

            {/* Quick Telegram message simulator */}
            <form onSubmit={handleSendQuickReply} className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 block">
                Send Direct Telegram Reply:
              </span>
              <textarea
                value={quickReplyText}
                onChange={(e) => setQuickReplyText(e.target.value)}
                placeholder="Type direct response message..."
                rows={2}
                className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-medium"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send via Bot</span>
              </button>
            </form>
          </motion.div>
        )}
      </div>

      {/* EXPORT USERS MODAL (JSON / CSV with Category Selection) */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-300 dark:border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Export Chat Users
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. Category Selection: All, Active, Blocked */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select User Category:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['All', 'Active', 'Blocked'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setExportCategory(cat)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        exportCategory === cat
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {cat} Users
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Format Selection: JSON or CSV */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select File Format:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportFormat('JSON')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      exportFormat === 'JSON'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="block font-bold text-xs">JSON (.json)</span>
                    <span className="text-[11px] text-slate-500">Structured data objects</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('CSV')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      exportFormat === 'CSV'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="block font-bold text-xs">CSV (.csv)</span>
                    <span className="text-[11px] text-slate-500">Spreadsheet table rows</span>
                  </button>
                </div>
              </div>

              {/* Download Action */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteExport}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {exportFormat}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
