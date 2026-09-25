import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trash2,
  RefreshCw,
  ArrowRight,
  RotateCcw,
  DollarSign,
  TrendingUp,
  CreditCard,
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  Key,
  Globe,
  Sliders,
  HelpCircle,
  Headphones,
  CheckCircle2,
  Send,
  ExternalLink,
  MessageSquare,
  Bot,
  History,
  Search,
  Copy,
  Check,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { BotItem, NotificationItem, User, TransferHistoryRecord } from '../types';
import {
  getTransferHistory30Days,
  saveTransferHistory30Days,
} from '../data/platformStore';
import { ConfirmationModal } from './ConfirmationModal';

export { SettingsView } from './SettingsView';

/* 1. RECYCLE BIN VIEW */
interface RecycleBinViewProps {
  recycleBots: BotItem[];
  onRestoreBot: (id: string) => void;
  onPermanentlyDelete: (id: string) => void;
  onEmptyRecycleBin: () => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({
  recycleBots,
  onRestoreBot,
  onPermanentlyDelete,
  onEmptyRecycleBin,
}) => {
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [botToDeleteForever, setBotToDeleteForever] = useState<BotItem | null>(null);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Recycle Bin
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Archived and deleted bots. Items here are retained for 30 days before permanent deletion.
          </p>
        </div>

        {recycleBots.length > 0 && (
          <button
            onClick={() => setShowEmptyConfirm(true)}
            className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Recycle Bin</span>
          </button>
        )}
      </div>

      {recycleBots.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl">
          <Trash2 className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Recycle Bin is empty
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            No bots have been moved to the recycle bin.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
          {recycleBots.map((bot) => (
            <div
              key={bot.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {bot.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {bot.username} • {bot.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => onRestoreBot(bot.id)}
                  className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-bold hover:bg-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => setBotToDeleteForever(bot)}
                  className="px-3 py-1.5 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modals for Destructive Actions */}
      <ConfirmationModal
        isOpen={showEmptyConfirm}
        onClose={() => setShowEmptyConfirm(false)}
        onConfirm={onEmptyRecycleBin}
        title="Empty Recycle Bin"
        message={`Are you sure you want to permanently delete all ${recycleBots.length} bot${recycleBots.length === 1 ? '' : 's'} in the recycle bin? This action is permanent and cannot be reversed.`}
        confirmText="Yes, Empty Bin"
        cancelText="Cancel"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={botToDeleteForever !== null}
        onClose={() => setBotToDeleteForever(null)}
        onConfirm={() => {
          if (botToDeleteForever) {
            onPermanentlyDelete(botToDeleteForever.id);
            setBotToDeleteForever(null);
          }
        }}
        title="Permanently Delete Bot"
        message={`Are you sure you want to permanently delete "${botToDeleteForever?.name}" (${botToDeleteForever?.username})? All commands, configuration, and data will be destroyed forever.`}
        confirmText="Yes, Delete Forever"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

/* 2. MONETIZATION VIEW */
export const MonetizationView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Bot Monetization &amp; Revenue
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
          Collect Telegram Stars, monthly subscriber fees, and digital payments across your bots.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Total Earnings
            </span>
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 block">
            $2,480.50
          </span>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1 inline-block">
            +32.4% this month
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Telegram Stars
            </span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 block">
            18,450 ★
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 inline-block">
            Ready to withdraw
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Active Subscriptions
            </span>
            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 block">
            348
          </span>
          <span className="text-xs text-blue-700 dark:text-blue-400 font-bold mt-1 inline-block">
            Recurring members
          </span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Payment Gateways Connected
        </h3>
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                Telegram Stars Native API
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                In-app digital goods for mobile &amp; desktop users
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Connected
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                Crypto Pay &amp; TON Connect
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                USDT, TON, and BTC instant settlements
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 3. TRANSFERS VIEW (WITH 30-DAY TRANSFER HISTORY SYSTEM) */
export const TransfersView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'history30d' | 'incoming' | 'outgoing'>('history30d');
  const [historyRecords, setHistoryRecords] = useState<TransferHistoryRecord[]>(() =>
    getTransferHistory30Days()
  );

  // Sync when history updates
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setHistoryRecords(e.detail);
      }
    };
    window.addEventListener('telebot_history_updated', handleUpdate);
    return () => window.removeEventListener('telebot_history_updated', handleUpdate);
  }, []);

  const [incomingTransfers, setIncomingTransfers] = useState([
    {
      id: 'tr-1',
      botName: '@VerificationOrganizationBot',
      botNumericId: '71928301',
      sender: '@dev_cluster_admin',
      date: '2026-09-15',
      expiresIn: '5 days',
      status: 'pending' as 'pending' | 'accepted' | 'rejected',
    },
    {
      id: 'tr-2',
      botName: '@CryptoArbitrageAutoBot',
      botNumericId: '61829103',
      sender: '@crypto_solutions',
      date: '2026-09-14',
      expiresIn: '4 days',
      status: 'pending' as 'pending' | 'accepted' | 'rejected',
    },
  ]);

  const [outgoingTransfers, setOutgoingTransfers] = useState([
    {
      id: 'tr-out-1',
      botName: '@DogsKopBot',
      botNumericId: '19283741',
      recipient: '@alex_telegram_dev',
      date: '2026-09-11',
      expiresIn: '6 days',
      status: 'pending' as 'pending' | 'accepted' | 'rejected',
    },
  ]);

  const [transferToast, setTransferToast] = useState<string | null>(null);

  // History filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'incoming' | 'outgoing' | 'completed' | 'pending'>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<TransferHistoryRecord | null>(null);

  const showToast = (msg: string) => {
    setTransferToast(msg);
    setTimeout(() => setTransferToast(null), 3200);
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    showToast('Transfer verification token copied!');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleAccept = (id: string, name: string) => {
    setIncomingTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'accepted' } : t))
    );
    showToast(`Accepted transfer of ${name}`);
  };

  const handleReject = (id: string, name: string) => {
    setIncomingTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'rejected' } : t))
    );
    showToast(`Rejected transfer of ${name}`);
  };

  const handleCancelOutgoing = (id: string, name: string) => {
    setOutgoingTransfers((prev) => prev.filter((t) => t.id !== id));
    setHistoryRecords((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, status: 'cancelled' as const } : r
      );
      saveTransferHistory30Days(updated);
      return updated;
    });
    showToast(`Cancelled outgoing transfer of ${name}`);
  };

  const handleCancelAllOutgoing = () => {
    const ids = outgoingTransfers.map((t) => t.id);
    setOutgoingTransfers([]);
    setHistoryRecords((prev) => {
      const updated = prev.map((r) =>
        ids.includes(r.id) ? { ...r, status: 'cancelled' as const } : r
      );
      saveTransferHistory30Days(updated);
      return updated;
    });
    showToast('Cancelled all outgoing transfer requests');
  };

  // Filtered 30-day history records
  const filteredHistory = historyRecords.filter((rec) => {
    const matchesSearch =
      rec.botName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.botNumericId.includes(searchQuery) ||
      rec.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.tokenHash.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (historyFilter === 'all') return true;
    if (historyFilter === 'incoming') return rec.type === 'incoming';
    if (historyFilter === 'outgoing') return rec.type === 'outgoing';
    if (historyFilter === 'completed') return rec.status === 'completed';
    if (historyFilter === 'pending') return rec.status === 'pending';
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {transferToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-slate-700/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{transferToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bot Transfers &amp; Ownership
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review live transfer requests and audit full bot handover activity over the last 30 days.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            30-Day Audit Trail Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            30-Day Transfers
          </span>
          <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">
            {historyRecords.length} Bots
          </span>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            100% Cryptographically verified
          </p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Incoming Requests
          </span>
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2 block">
            {incomingTransfers.filter((t) => t.status === 'pending').length} Pending
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Auto-expires 7 days from request date
          </p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Outgoing Handover
          </span>
          <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">
            {outgoingTransfers.filter((t) => t.status === 'pending').length} Outgoing
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Awaiting recipient authorization
          </p>
        </div>
      </div>

      {/* Tabs for 30-Day History vs Incoming vs Outgoing */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveSubTab('history30d')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'history30d'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Last 30 Days History</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">
                {historyRecords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('incoming')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'incoming'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Incoming Requests</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                {incomingTransfers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('outgoing')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'outgoing'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Outgoing Requests</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                {outgoingTransfers.length}
              </span>
            </button>
          </div>
        </div>

        {/* 1. LAST 30 DAYS TRANSFER HISTORY VIEW */}
        {activeSubTab === 'history30d' && (
          <div className="space-y-4">
            {/* Search and Filter Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 30-day transfers by bot name, ID, or user..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'incoming', 'outgoing', 'completed', 'pending'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                      historyFilter === f
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List of 30-Day Records */}
            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No transfer records found matching your filters
                </p>
                <p className="text-[11px] text-slate-500">
                  Try clearing your search query or selecting &quot;All&quot; filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          {rec.botName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-mono text-slate-600 dark:text-slate-300">
                          ID: {rec.botNumericId}
                        </span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            rec.type === 'incoming'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                              : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          {rec.type === 'incoming' ? 'Incoming Transferred' : 'Outgoing Handover'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500">
                        From <strong className="text-slate-800 dark:text-slate-200">{rec.sender}</strong> → To <strong className="text-slate-800 dark:text-slate-200">{rec.recipient}</strong>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>{rec.date} ({rec.relativeTime})</span>
                        <span>•</span>
                        <span>{rec.commandsCount} commands</span>
                        <span>•</span>
                        <span>{rec.foldersCount} folders</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {/* Status pill */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          rec.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                            : rec.status === 'pending'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rec.status.toUpperCase()}
                      </span>

                      {/* Token hash copy button */}
                      <button
                        type="button"
                        onClick={() => handleCopyToken(rec.tokenHash)}
                        title="Copy cryptographic proof token"
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedToken === rec.tokenHash ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{rec.tokenHash.substring(0, 15)}</span>
                      </button>

                      {/* Audit Certificate Modal trigger */}
                      <button
                        type="button"
                        onClick={() => setSelectedAuditRecord(rec)}
                        className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Audit Proof
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. INCOMING TRANSFERS VIEW */}
        {activeSubTab === 'incoming' && (
          <div className="space-y-3">
            {incomingTransfers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No incoming transfers pending.</p>
            ) : (
              incomingTransfers.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {req.botName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                        ID: {req.botNumericId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      From <strong className="text-slate-700 dark:text-slate-300">{req.sender}</strong> • Requested {req.date} • {req.expiresIn}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAccept(req.id, req.botName)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(req.id, req.botName)}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : req.status === 'accepted' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                        Accepted
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-600">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. OUTGOING TRANSFERS VIEW */}
        {activeSubTab === 'outgoing' && (
          <div className="space-y-3">
            {outgoingTransfers.length > 0 && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <span className="text-xs text-slate-500 font-bold">
                  Active Outgoing Requests ({outgoingTransfers.length})
                </span>
                <button
                  type="button"
                  onClick={handleCancelAllOutgoing}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel All</span>
                </button>
              </div>
            )}

            {outgoingTransfers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No outgoing transfers active.</p>
            ) : (
              outgoingTransfers.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white block">
                      {req.botName}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Transfer to <strong className="text-slate-700 dark:text-slate-300">{req.recipient}</strong> • Auto-expires in {req.expiresIn}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-600">
                      Pending Approval
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCancelOutgoing(req.id, req.botName)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                      title="Cancel this outgoing request"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Audit Certificate Modal */}
      <AnimatePresence>
        {selectedAuditRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Cryptographic Transfer Audit Proof
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Recorded in last 30 days immutable ledger
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAuditRecord(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bot Entity</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedAuditRecord.botName} (ID {selectedAuditRecord.botNumericId})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transfer Type</span>
                    <span className="font-bold text-slate-900 dark:text-white uppercase">
                      {selectedAuditRecord.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sender Party</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {selectedAuditRecord.sender}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recipient Party</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {selectedAuditRecord.recipient}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timestamp</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {selectedAuditRecord.date} ({selectedAuditRecord.relativeTime})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedAuditRecord.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    SHA-256 Ledger Token Hash
                  </label>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all select-all border border-slate-200 dark:border-slate-700">
                    {selectedAuditRecord.tokenHash}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAuditRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* 5. HELP & SUPPORT VIEW */
export const HelpSupportView: React.FC = () => {
  const [ticketSent, setTicketSent] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    setTicketSent(true);
    setMessage('');
    setTimeout(() => setTicketSent(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Help &amp; Customer Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
          Documentation, tutorials for Telegram BotFather, and 24/7 technical assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              BotFather Quickstart
            </h3>
          </div>
          <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed font-medium">
            <li>Open Telegram and message <strong>@BotFather</strong></li>
            <li>Send the command <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono font-semibold">/newbot</code></li>
            <li>Choose a display name and unique username ending with &lsquo;bot&rsquo;</li>
            <li>Copy your HTTP API Token into Telebot Creator</li>
            <li>Select your webhook preset and hit Deploy!</li>
          </ol>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Need Instant Help?
            </h3>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Our engineers monitor telegram cluster health 24 hours a day with 99.99% uptime guarantee. Submit a query below to get in touch with our support squad.
          </p>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Average Response Time: 3 minutes
          </div>
        </div>
      </div>

      {/* Support Ticket Form */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Contact Telebot Creator Support
        </h3>

        {ticketSent && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            Your support ticket has been received! An agent will respond via your registered email shortly.
          </div>
        )}

        <form onSubmit={handleSendTicket} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Message or Technical Issue
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question, webhook error, or bot inquiry..."
              className="w-full p-3 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Ticket</span>
          </button>
        </form>
      </div>
    </div>
  );
};
