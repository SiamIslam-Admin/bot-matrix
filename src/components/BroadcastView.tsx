import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Plus,
  ArrowLeft,
  Search,
  Check,
  X,
  Send,
  Sparkles,
  Layers,
  ExternalLink,
  Bot,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Activity,
  Eye,
  Link,
  Users,
  Play,
  Pause,
  Copy,
  Terminal,
  Globe,
  Share2,
  Code,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { BotItem, BroadcastItem, InlineButton, TelegramButtonType, BotBroadcastStats } from '../types';
import { BroadcastCardsSkeleton } from './SkeletonScreen';

interface BroadcastViewProps {
  bots: BotItem[];
  broadcasts: BroadcastItem[];
  onSendBroadcast: (broadcast: BroadcastItem) => void;
  onDeleteBroadcast?: (id: string) => void;
  onUpdateBroadcast?: (broadcast: BroadcastItem) => void;
}

export const BroadcastView: React.FC<BroadcastViewProps> = ({
  bots,
  broadcasts,
  onSendBroadcast,
  onDeleteBroadcast,
  onUpdateBroadcast,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Done' | 'Failed'>('All');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Live Details Modal & Clean System State
  const [selectedBroadcastForDetails, setSelectedBroadcastForDetails] = useState<BroadcastItem | null>(null);
  const [confirmCleanModal, setConfirmCleanModal] = useState<{
    isOpen: boolean;
    broadcast: BroadcastItem;
  } | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showActionToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const handleConfirmClean = (targetBc: BroadcastItem) => {
    const failedCountBefore = targetBc.failedCount !== undefined
      ? targetBc.failedCount
      : (targetBc.failedRecipients?.length || 0);

    const updated: BroadcastItem = {
      ...targetBc,
      failedCount: 0,
      failedRecipients: [],
      cleanedFailed: true,
    };

    if (onUpdateBroadcast) {
      onUpdateBroadcast(updated);
    }
    if (selectedBroadcastForDetails && selectedBroadcastForDetails.id === targetBc.id) {
      setSelectedBroadcastForDetails(updated);
    }
    setConfirmCleanModal(null);
    showActionToast(`Cleaned ${failedCountBefore} failed user${failedCountBefore !== 1 ? 's' : ''} from broadcast pool`);
  };

  // New broadcast form state
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);
  const [showSelectBotsModal, setShowSelectBotsModal] = useState(false);
  const [botSearchQuery, setBotSearchQuery] = useState('');

  const [messageType, setMessageType] = useState<
    'Text' | 'Photo' | 'Video' | 'Audio' | 'Doc' | 'GIF' | 'Voice' | 'VidNote' | 'Sticker'
  >('Text');
  const [messageText, setMessageText] = useState('');
  const [parseMode, setParseMode] = useState<'None' | 'HTML' | 'Markdown' | 'MarkdownV2'>('HTML');
  const [inlineButtons, setInlineButtons] = useState<InlineButton[]>([]);
  const [languageFilter, setLanguageFilter] = useState('');
  const [targetUserLimitInput, setTargetUserLimitInput] = useState<string>('All');
  const [detailsBotSearch, setDetailsBotSearch] = useState<string>('');
  const [detailsBotStatusFilter, setDetailsBotStatusFilter] = useState<'All' | 'Delivering' | 'Done' | 'Paused'>('All');

  const [isSending, setIsSending] = useState(false);
  const [sendSuccessToast, setSendSuccessToast] = useState(false);
  const [confirmDeleteBroadcast, setConfirmDeleteBroadcast] = useState<BroadcastItem | null>(null);

  const handleTogglePauseResume = (bc: BroadcastItem) => {
    const nextStatus = bc.status === 'Active' ? 'Paused' : 'Active';
    const updated: BroadcastItem = {
      ...bc,
      status: nextStatus,
      botStats: bc.botStats?.map((b) => ({
        ...b,
        status: nextStatus === 'Active' ? (b.sentCount >= b.targetCount ? 'Done' : 'Delivering') : 'Paused',
      })),
    };
    if (onUpdateBroadcast) {
      onUpdateBroadcast(updated);
    }
    setSelectedBroadcastForDetails(updated);
    showActionToast(nextStatus === 'Paused' ? 'Broadcast paused' : 'Broadcast resumed');
  };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Pagination for broadcasts
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePageChange = (page: number) => {
    setIsTransitioning(true);
    setCurrentPage(page);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  const handlePageSizeChange = (size: number) => {
    setIsTransitioning(true);
    setPageSize(size);
    setCurrentPage(1);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  // Filtered broadcast list
  const filteredBroadcasts = broadcasts.filter((b) => {
    if (activeTab === 'All') return true;
    return b.status === activeTab;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBroadcasts.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedBroadcasts = filteredBroadcasts.slice(startIndex, startIndex + pageSize);

  // Insert personalization tag at cursor
  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) {
      setMessageText((prev) => prev + tag);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = messageText.substring(0, start) + tag + messageText.substring(end);
    setMessageText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  // Bot selection toggles
  const handleToggleBot = (botId: string) => {
    if (selectedBotIds.includes(botId)) {
      setSelectedBotIds(selectedBotIds.filter((id) => id !== botId));
    } else {
      setSelectedBotIds([...selectedBotIds, botId]);
    }
  };

  const handleSelectAllBots = () => {
    setSelectedBotIds(bots.map((b) => b.id));
  };

  const handleClearSelectedBots = () => {
    setSelectedBotIds([]);
  };

  // Inline buttons manager with all Telegram button types
  const handleAddButton = (type: TelegramButtonType = 'url') => {
    const defaultText =
      type === 'url'
        ? 'Open Link'
        : type === 'callback_data'
        ? 'Confirm Action'
        : type === 'web_app'
        ? 'Launch Mini App'
        : type === 'switch_inline_query'
        ? 'Share with Friends'
        : 'Copy Code';

    setInlineButtons([
      ...inlineButtons,
      {
        id: `btn-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
        text: defaultText,
        type,
        url: type === 'url' ? 'https://t.me/' : '',
        callbackData: type === 'callback_data' ? 'action_payload' : '',
        webAppUrl: type === 'web_app' ? 'https://' : '',
        switchInlineQuery: type === 'switch_inline_query' ? 'query' : '',
        copyText: type === 'copy_text' ? 'TELEBOT-2026' : '',
      },
    ]);
  };

  const handleRemoveButton = (btnId: string) => {
    setInlineButtons(inlineButtons.filter((b) => b.id !== btnId));
  };

  const handleUpdateButton = (btnId: string, patch: Partial<InlineButton>) => {
    setInlineButtons(
      inlineButtons.map((b) => (b.id === btnId ? { ...b, ...patch } : b))
    );
  };

  // Send Broadcast Action
  const handleDispatchBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBotIds.length === 0) {
      alert('Please select at least one bot to send the broadcast to.');
      return;
    }
    if (!messageText.trim()) {
      alert('Please write a message to broadcast.');
      return;
    }

    setIsSending(true);

    const chosenBots = bots.filter((b) => selectedBotIds.includes(b.id));
    const totalUsers = chosenBots.reduce((sum, b) => sum + (b.activeUsers || 42), 0);
    const parsedLimit =
      targetUserLimitInput === 'All' || !targetUserLimitInput.trim()
        ? totalUsers
        : Math.max(1, parseInt(targetUserLimitInput.replace(/\D/g, '')) || totalUsers);

    setTimeout(() => {
      const inProg = Math.floor(parsedLimit * 0.15);
      const sent = parsedLimit - inProg;

      const botStatsList = chosenBots.map((b) => {
        const share =
          chosenBots.length === 1
            ? parsedLimit
            : Math.round(parsedLimit / chosenBots.length);
        const botSent = Math.floor(share * 0.85);
        return {
          botId: b.id,
          botName: b.name,
          botUsername: b.username,
          targetCount: share,
          sentCount: botSent,
          failedCount: 0,
          status: (share - botSent > 0 ? 'Delivering' : 'Done') as 'Delivering' | 'Done',
          speed: `${Math.floor(25 + Math.random() * 15)} msgs/sec`,
        };
      });

      const newBroadcast: BroadcastItem = {
        id: `bc-${Date.now()}`,
        title: messageText.slice(0, 32) + (messageText.length > 32 ? '...' : ''),
        targetBotIds: selectedBotIds,
        targetBotUsernames: chosenBots.map((b) => b.username),
        messageType,
        messageText,
        parseMode,
        inlineButtons,
        languageFilter: languageFilter.trim() || undefined,
        status: inProg > 0 ? 'Active' : 'Done',
        sentCount: sent,
        totalTargetUsers: parsedLimit,
        targetUserLimit: parsedLimit,
        botStats: botStatsList,
        inProgressCount: inProg,
        failedCount: 0,
        cleanedFailed: false,
        deliverySpeed: '32 msgs/sec',
        createdAt: 'Just now',
      };

      onSendBroadcast(newBroadcast);
      setIsSending(false);
      setSendSuccessToast(true);

      setTimeout(() => {
        setSendSuccessToast(false);
        setIsCreatingNew(false);
        // Reset form
        setMessageText('');
        setSelectedBotIds([]);
        setInlineButtons([]);
      }, 1200);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* FULL-PAGE VIEW 1: LIVE BROADCAST DETAILS */}
      {selectedBroadcastForDetails ? (
        (() => {
          const bc = selectedBroadcastForDetails;
          const inProgress =
            bc.inProgressCount !== undefined
              ? bc.inProgressCount
              : bc.status === 'Active'
              ? Math.max(0, bc.totalTargetUsers - bc.sentCount)
              : 0;
          const failed =
            bc.failedCount !== undefined
              ? bc.failedCount
              : bc.failedRecipients?.length || 0;
          const progressPct = Math.min(
            100,
            Math.round((bc.sentCount / (bc.totalTargetUsers || 1)) * 100)
          );

          const botStatsList: BotBroadcastStats[] =
            bc.botStats && bc.botStats.length > 0
              ? bc.botStats
              : bc.targetBotUsernames.map((u, i) => {
                  const bId = bc.targetBotIds[i] || `bot-${i}`;
                  const foundBot = bots.find((b) => b.id === bId || b.username === u);
                  const totalPart = Math.round(
                    bc.totalTargetUsers / (bc.targetBotUsernames.length || 1)
                  );
                  const sentPart = Math.round(
                    bc.sentCount / (bc.targetBotUsernames.length || 1)
                  );
                  return {
                    botId: bId,
                    botName: foundBot?.name || u.replace('@', ''),
                    botUsername: u,
                    targetCount: totalPart,
                    sentCount: sentPart,
                    failedCount: Math.round(
                      failed / (bc.targetBotUsernames.length || 1)
                    ),
                    status:
                      bc.status === 'Active'
                        ? 'Delivering'
                        : bc.status === 'Done'
                        ? 'Done'
                        : bc.status === 'Paused'
                        ? 'Paused'
                        : 'Failed',
                    speed: bc.deliverySpeed || '30 msgs/sec',
                  };
                });

          const filteredBotStatsList = botStatsList.filter((b) => {
            const matchesQuery =
              !detailsBotSearch.trim() ||
              b.botName.toLowerCase().includes(detailsBotSearch.toLowerCase()) ||
              b.botUsername.toLowerCase().includes(detailsBotSearch.toLowerCase());
            const matchesStatus =
              detailsBotStatusFilter === 'All' ||
              (detailsBotStatusFilter === 'Delivering' && b.status === 'Delivering') ||
              (detailsBotStatusFilter === 'Done' && b.status === 'Done') ||
              (detailsBotStatusFilter === 'Paused' && b.status === 'Paused');
            return matchesQuery && matchesStatus;
          });

          return (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* TOP NAVIGATION & ACTION CONTROLS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Top Back Icon Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBroadcastForDetails(null);
                      setDetailsBotSearch('');
                      setDetailsBotStatusFilter('All');
                    }}
                    className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all shrink-0"
                    title="Back to Campaigns"
                  >
                    <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold">Back</span>
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Live Analytics Engine
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {bc.createdAt}
                      </span>
                    </div>
                    <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                      {bc.title}
                    </h1>
                  </div>
                </div>

                {/* STATUS & ACTIONS: ONLY PAUSE / RESUME (NO DELETE) */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      bc.status === 'Active'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : bc.status === 'Done'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : bc.status === 'Paused'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {bc.status === 'Active' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                    <span>{bc.status === 'Active' ? 'Delivering Live' : bc.status}</span>
                  </span>

                  {/* ONLY Pause / Resume Campaign Button */}
                  {bc.status === 'Active' ? (
                    <button
                      type="button"
                      onClick={() => handleTogglePauseResume(bc)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Campaign</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTogglePauseResume(bc)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume Campaign</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION A: AGGREGATE STATS & AVERAGE TOTALS */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Overall Campaign Performance &amp; Totals
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Speed: {bc.deliverySpeed || '32 msgs/sec'} • Mode: {bc.parseMode}
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                  {/* 1. Target Audience */}
                  <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="font-semibold">Target Audience</span>
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                        {bc.totalTargetUsers.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400">users</span>
                    </div>
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono truncate">
                        Limit: {bc.targetUserLimit ? `${bc.targetUserLimit.toLocaleString()} Users` : 'All Users'}
                      </span>
                    </div>
                  </div>

                  {/* 2. Delivered Success */}
                  <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="font-semibold">Delivered Success</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {bc.sentCount.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600/80">({progressPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          bc.status === 'Active' ? 'bg-blue-600 animate-pulse' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. In Progress Buffer */}
                  <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="font-semibold">In Progress Buffer</span>
                      <Activity className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                        {inProgress.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400">queued</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {inProgress > 0 ? 'Worker dispatching...' : 'Queue completed'}
                    </span>
                  </div>

                  {/* 4. Failed Deliveries */}
                  <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="font-semibold">Failed Deliveries</span>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={`text-xl sm:text-2xl font-black font-mono ${
                          failed > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {failed}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {failed > 0 ? 'errors' : 'clean'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {failed > 0 ? 'Blocked or purged' : '100% clean delivery'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION B: MULTI-BOT PER-BOT BREAKDOWN (Compact, high-density & responsive) */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Participating Bots Breakdown ({botStatsList.length} Bots)
                    </h3>
                  </div>

                  {/* Search & Filter Toolbar for Multiple Bots */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search bot..."
                        value={detailsBotSearch}
                        onChange={(e) => setDetailsBotSearch(e.target.value)}
                        className="pl-7 pr-3 py-1 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-44"
                      />
                      <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      {(['All', 'Delivering', 'Done', 'Paused'] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setDetailsBotStatusFilter(filter)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            detailsBotStatusFilter === filter
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {filteredBotStatsList.length === 0 ? (
                  <div className="p-8 rounded-2xl glass-panel text-center border border-slate-200 dark:border-slate-800">
                    <Bot className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No participating bots match your search filter
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailsBotSearch('');
                        setDetailsBotStatusFilter('All');
                      }}
                      className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                    {filteredBotStatsList.map((bot) => {
                      const botProgress = Math.min(
                        100,
                        Math.round((bot.sentCount / (bot.targetCount || 1)) * 100)
                      );
                      return (
                        <div
                          key={bot.botId}
                          className="glass-panel p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs hover:border-blue-500/40 transition-all flex flex-col justify-between"
                        >
                          {/* Bot Mini Header */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                {bot.botName.charAt(0) || 'B'}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                                  {bot.botName}
                                </h4>
                                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate block">
                                  {bot.botUsername}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                                bot.status === 'Delivering'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : bot.status === 'Done'
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                  : bot.status === 'Paused'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {bot.status === 'Delivering' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              )}
                              <span>{bot.status}</span>
                            </span>
                          </div>

                          {/* Compact Metrics Row */}
                          <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-center">
                            <div>
                              <span className="text-[9px] font-bold uppercase text-slate-400 block">
                                Target
                              </span>
                              <span className="text-[11px] font-black font-mono text-slate-800 dark:text-slate-200">
                                {bot.targetCount.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold uppercase text-slate-400 block">
                                Sent
                              </span>
                              <span className="text-[11px] font-black font-mono text-emerald-600 dark:text-emerald-400">
                                {bot.sentCount.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold uppercase text-slate-400 block">
                                Failed
                              </span>
                              <span
                                className={`text-[11px] font-black font-mono ${
                                  bot.failedCount > 0
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {bot.failedCount}
                              </span>
                            </div>
                          </div>

                          {/* Slim Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-500 font-semibold">
                                Progress
                              </span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {botProgress}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  bot.status === 'Delivering'
                                    ? 'bg-blue-600 animate-pulse'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${botProgress}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>{bot.speed || '30/s'}</span>
                              <span>
                                {bot.targetCount - bot.sentCount > 0
                                  ? `${(bot.targetCount - bot.sentCount).toLocaleString()} left`
                                  : 'Done'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()
      ) : !isCreatingNew ? (
        /* VIEW 1: CAMPAIGNS LIST HEADER */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Mass Messaging Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Broadcast Manager</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {broadcasts.length}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Dispatch synchronized announcements, marketing pushes, and updates across your bots simultaneously.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>
      ) : (
        /* VIEW 2: NEW BROADCAST HEADER */
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400">
                Compose Campaign
              </span>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                ← New Broadcast
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: BROADCAST LIST VIEW */}
      {!selectedBroadcastForDetails && !isCreatingNew && (
        <div className="space-y-4">
          {/* Status Tabs: All, Active, Done, Failed */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {(['All', 'Active', 'Done', 'Failed'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Broadcasts List or Empty State */}
          {filteredBroadcasts.length === 0 ? (
            <div className="glass-panel p-16 text-center rounded-3xl space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-3xl shadow-md shadow-blue-500/10">
                📡
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                No broadcasts yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tap <strong className="text-blue-600 dark:text-blue-400">New</strong> to send a broadcast to your bot users.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Broadcast</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isTransitioning ? (
                <BroadcastCardsSkeleton count={Math.min(pageSize, 6)} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {paginatedBroadcasts.map((bc) => {
                  const inProgress = bc.inProgressCount !== undefined
                    ? bc.inProgressCount
                    : (bc.status === 'Active' ? Math.max(0, bc.totalTargetUsers - bc.sentCount) : 0);
                  const failed = bc.failedCount !== undefined
                    ? bc.failedCount
                    : (bc.failedRecipients?.length || 0);
                  const progressPct = Math.min(100, Math.round((bc.sentCount / (bc.totalTargetUsers || 1)) * 100));

                  return (
                    <div
                      key={bc.id}
                      className="glass-panel p-5 rounded-2xl space-y-3.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              bc.status === 'Active'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5'
                                : bc.status === 'Done'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {bc.status === 'Active' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            )}
                            <span>● {bc.status}</span>
                          </span>
                          <span className="text-xs text-slate-400">• {bc.createdAt}</span>
                        </div>

                        {onDeleteBroadcast && (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteBroadcast(bc)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete broadcast"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {bc.title}
                      </h4>

                      {/* LIVE METRICS: In Process & Failed Users */}
                      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90">
                        {/* Processed / In Progress */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>In Process</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                              {inProgress.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              / {bc.totalTargetUsers.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                bc.status === 'Active' ? 'bg-blue-600 animate-pulse' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {bc.sentCount.toLocaleString()} delivered ({progressPct}%)
                          </span>
                        </div>

                        {/* Failed Count & Clean action */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Failed</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-black font-mono ${
                                failed > 0
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {failed}
                            </span>
                            {bc.cleanedFailed ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                                Cleaned
                              </span>
                            ) : failed > 0 ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmCleanModal({ isOpen: true, broadcast: bc });
                                }}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 transition-colors cursor-pointer"
                                title="Clean failed users"
                              >
                                Clean
                              </button>
                            ) : null}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {bc.cleanedFailed ? 'All purged' : failed > 0 ? 'Retry / inactive' : '0 delivery errors'}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer: Target Bots & Live Details button */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <Bot className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{bc.targetBotUsernames.join(', ')}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedBroadcastForDetails(bc)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Live Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

              {/* Broadcasts Pagination Toolbar */}
              {totalPages > 1 && (
                <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>
                      Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filteredBroadcasts.length)} of {filteredBroadcasts.length} campaigns
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="text-[11px]">Per page</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    >
                      {[4, 6, 12, 24].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePageChange(1)}
                      disabled={safePage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="First Page"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePageChange(safePage - 1)}
                      disabled={safePage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {safePage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePageChange(safePage + 1)}
                      disabled={safePage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={safePage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Last Page"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: NEW BROADCAST WORKFLOW (Based on exact user outline) */}
      {!selectedBroadcastForDetails && isCreatingNew && (
        <form onSubmit={handleDispatchBroadcast} className="glass-panel p-6 rounded-3xl space-y-6">
          {/* BOTS SECTION */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              BOTS
            </label>

            <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              {selectedBotIds.length === 0 ? (
                <span className="text-xs text-slate-500 italic">Tap to choose bots...</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedBotIds.map((id) => {
                    const b = bots.find((x) => x.id === id);
                    return (
                      <span
                        key={id}
                        className="px-2.5 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Bot className="w-3 h-3" />
                        <span>{b ? b.username : id}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleBot(id)}
                          className="hover:text-rose-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowSelectBotsModal(true)}
                className="ml-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
              >
                Choose
              </button>
            </div>
          </div>

          {/* AUDIENCE TARGET LIMIT / USER COUNT SECTION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                AUDIENCE TARGET LIMIT / USER COUNT
              </label>
              <span className="text-[11px] text-slate-400">
                Limit broadcast to specific recipient count
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={targetUserLimitInput}
                  onChange={(e) => setTargetUserLimitInput(e.target.value)}
                  placeholder="e.g. 5000 or All"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['All', '500', '1,000', '5,000', '10,000', '50,000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTargetUserLimitInput(val.replace(',', ''))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      targetUserLimitInput === val.replace(',', '')
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              The broadcast engine will partition this user target across the selected bots evenly.
            </p>
          </div>

          {/* MESSAGE TYPE SECTION */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              MESSAGE TYPE
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  'Text',
                  'Photo',
                  'Video',
                  'Audio',
                  'Doc',
                  'GIF',
                  'Voice',
                  'VidNote',
                  'Sticker',
                ] as const
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMessageType(type)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    messageType === type
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* MESSAGE SECTION */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                MESSAGE
              </label>

              {/* Personalize per user tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400">Personalize</span>
                {['{user_name}', '{username}', '{user_id}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertTag(tag)}
                    className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 text-[11px] font-mono font-bold cursor-pointer transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              ref={textareaRef}
              rows={5}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write your message... Use {user_name}, {username}, or {user_id} to personalize for each recipient."
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs"
            />
          </div>

          {/* PARSE MODE SECTION */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              PARSE MODE
            </label>
            <div className="flex flex-wrap gap-2">
              {(['None', 'HTML', 'Markdown', 'MarkdownV2'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setParseMode(mode)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    parseMode === mode
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* INLINE BUTTONS SECTION */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  INLINE BUTTONS ({inlineButtons.length})
                </label>
                <p className="text-[11px] text-slate-400">
                  Supports URL, Callback Data, Telegram Mini Apps, Switch Inline Query, and Copy Text
                </p>
              </div>

              {/* Quick Add Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddButton('url')}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddButton('callback_data')}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Callback</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddButton('web_app')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Web App</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddButton('switch_inline_query')}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddButton('copy_text')}
                  className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Copy Text</span>
                </button>
              </div>
            </div>

            {inlineButtons.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <p className="text-xs text-slate-500">
                  No inline buttons added — click any button type above to attach buttons to this broadcast message
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {inlineButtons.map((btn, idx) => {
                  const bType = btn.type || 'url';
                  return (
                    <div
                      key={btn.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        {/* Type indicator & selector */}
                        <div className="flex items-center gap-1.5 w-full sm:w-44">
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            #{idx + 1}
                          </span>
                          <select
                            value={bType}
                            onChange={(e) =>
                              handleUpdateButton(btn.id, {
                                type: e.target.value as TelegramButtonType,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                          >
                            <option value="url">URL Link</option>
                            <option value="callback_data">Callback Data</option>
                            <option value="web_app">Telegram Web App</option>
                            <option value="switch_inline_query">Switch Inline Query</option>
                            <option value="copy_text">Copy Text Button</option>
                          </select>
                        </div>

                        {/* Button Label Input */}
                        <input
                          type="text"
                          value={btn.text}
                          onChange={(e) => handleUpdateButton(btn.id, { text: e.target.value })}
                          placeholder="Button label (e.g. Open Portal)"
                          className="flex-1 w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                        />

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveButton(btn.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer self-end sm:self-auto transition-colors"
                          title="Remove button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Type-Specific Payload Input */}
                      <div className="pl-0 sm:pl-7">
                        {bType === 'url' && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <input
                              type="url"
                              value={btn.url || ''}
                              onChange={(e) => handleUpdateButton(btn.id, { url: e.target.value })}
                              placeholder="https://t.me/your_channel or https://example.com"
                              className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        )}

                        {bType === 'callback_data' && (
                          <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <input
                              type="text"
                              value={btn.callbackData || ''}
                              onChange={(e) =>
                                handleUpdateButton(btn.id, { callbackData: e.target.value })
                              }
                              placeholder="Callback payload string (e.g. vote:candidate_42 or menu:refresh)"
                              className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        )}

                        {bType === 'web_app' && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <input
                              type="url"
                              value={btn.webAppUrl || ''}
                              onChange={(e) =>
                                handleUpdateButton(btn.id, { webAppUrl: e.target.value })
                              }
                              placeholder="HTTPS Telegram Mini App URL (e.g. https://miniapp.telebot.org)"
                              className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        )}

                        {bType === 'switch_inline_query' && (
                          <div className="flex items-center gap-2">
                            <Share2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <input
                              type="text"
                              value={btn.switchInlineQuery || ''}
                              onChange={(e) =>
                                handleUpdateButton(btn.id, { switchInlineQuery: e.target.value })
                              }
                              placeholder="Query string inserted into chat (e.g. share_promo_code)"
                              className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        )}

                        {bType === 'copy_text' && (
                          <div className="flex items-center gap-2">
                            <Copy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <input
                              type="text"
                              value={btn.copyText || ''}
                              onChange={(e) =>
                                handleUpdateButton(btn.id, { copyText: e.target.value })
                              }
                              placeholder="Text copied to user clipboard when pressed (e.g. PROMO2026)"
                              className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* LANGUAGE FILTER SECTION */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              LANGUAGE FILTER (optional)
            </label>
            <input
              type="text"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              placeholder="e.g. en, ru, fa — leave blank for all"
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Dispatching to telegram network...</span>
                </>
              ) : sendSuccessToast ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Broadcast Dispatched!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send broadcast to bots</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* SELECT BOTS MODAL */}
      <AnimatePresence>
        {showSelectBotsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Select Bots
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearSelectedBots}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Clear
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleSelectAllBots}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    All ({bots.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSelectBotsModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search bots input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={botSearchQuery}
                  onChange={(e) => setBotSearchQuery(e.target.value)}
                  placeholder="Search bots…"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Bots list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-72">
                {bots
                  .filter(
                    (b) =>
                      b.name.toLowerCase().includes(botSearchQuery.toLowerCase()) ||
                      b.username.toLowerCase().includes(botSearchQuery.toLowerCase())
                  )
                  .map((b) => {
                    const isSelected = selectedBotIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => handleToggleBot(b.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 text-blue-950 dark:text-blue-200'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {b.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                              {b.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 truncate block">
                              {b.username}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {b.status}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSelectBotsModal(false)}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
                >
                  Confirm — {selectedBotIds.length} bot{selectedBotIds.length !== 1 ? 's' : ''} selected
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL FOR CLEANING FAILED USERS */}
      <AnimatePresence>
        {confirmCleanModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Clean Failed Users?
                  </h3>
                  <p className="text-xs text-slate-500">
                    {confirmCleanModal.broadcast.title}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to clean and remove{' '}
                <strong className="text-rose-600 dark:text-rose-400 font-mono">
                  {confirmCleanModal.broadcast.failedCount !== undefined
                    ? confirmCleanModal.broadcast.failedCount
                    : (confirmCleanModal.broadcast.failedRecipients?.length || 0)}{' '}
                  failed recipient(s)
                </strong>{' '}
                from this broadcast? This will reset the failure counter to 0 and remove inactive user IDs from future retry queues.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmCleanModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmClean(confirmCleanModal.broadcast)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Yes, Confirm & Clean</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL FOR DELETING BROADCAST CAMPAIGN */}
      <AnimatePresence>
        {confirmDeleteBroadcast && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Delete Broadcast Campaign?
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-xs">
                    {confirmDeleteBroadcast.title}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete this broadcast campaign? This action cannot be undone and campaign logs will be removed.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteBroadcast(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteBroadcast && confirmDeleteBroadcast) {
                      onDeleteBroadcast(confirmDeleteBroadcast.id);
                      setActionToast(`Deleted campaign "${confirmDeleteBroadcast.title}"`);
                      setTimeout(() => setActionToast(null), 2500);
                      if (selectedBroadcastForDetails?.id === confirmDeleteBroadcast.id) {
                        setSelectedBroadcastForDetails(null);
                      }
                      setConfirmDeleteBroadcast(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Campaign</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTION TOAST */}
      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-800 dark:border-slate-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{actionToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
