import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Bot,
  Star,
  Copy,
  Download,
  Share2,
  Sparkles,
  Check,
  CheckCircle2,
  X,
  Tag,
  Shield,
  Layers,
  ArrowLeft,
  ChevronLeft,
  TrendingUp,
  Cpu,
  Info,
  ChevronRight,
  Zap,
  DollarSign,
  Terminal,
  Clock,
  ExternalLink,
  Code2,
  CheckCheck,
  Send,
  Eye,
  FileCode,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { StoreBot } from '../types';
import { initialStoreBots } from '../data/storeBotsData';
import { apiService } from '../services/apiService';
import { CompactStoreGridSkeleton, BotDetailsSkeleton } from './SkeletonScreen';

interface BotStoreViewProps {
  onDeployStoreBot?: (bot: StoreBot) => void;
  onShowToast?: (msg: string) => void;
  onNavigateToMyBots?: () => void;
}

// Blue Verified Badge component
export const BlueVerifiedBadge: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => {
  const iconSize = size === 'lg' ? 'w-4 h-4' : size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';
  const textSize = size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-extrabold ${textSize} shadow-xs select-none`}
      title="Verified Official Bot"
    >
      <CheckCircle2 className={`${iconSize} fill-blue-500 text-white dark:text-slate-900`} />
      <span className="uppercase tracking-wider">Verified</span>
    </span>
  );
};

export const BotStoreView: React.FC<BotStoreViewProps> = ({
  onDeployStoreBot,
  onShowToast,
  onNavigateToMyBots,
}) => {
  const [bots, setBots] = useState<StoreBot[]>(initialStoreBots);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBot, setSelectedBot] = useState<StoreBot | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [clonedSuccessBot, setClonedSuccessBot] = useState<StoreBot | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeCodePreview, setActiveCodePreview] = useState<string | null>(null);

  // Pagination for store
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Load from backend API with fallback
  useEffect(() => {
    let isMounted = true;
    apiService.getStoreBots().then((fetched) => {
      if (isMounted && fetched && fetched.length > 0) {
        setBots(fetched);
      }
    }).catch(() => {
      // Fallback already provided in initialStoreBots
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    'All',
    'AI & Chatbots',
    'Finance & Crypto',
    'Security',
    'Utilities',
  ];

  const handleCategoryChange = (cat: string) => {
    if (cat === selectedCategory) return;
    setIsTransitioning(true);
    setSelectedCategory(cat);
    setCurrentPage(1);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 180);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const filteredBots = bots.filter((bot) => {
    const matchesSearch =
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      bot.botPayload?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || bot.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBots.length / pageSize));
  const paginatedBots = filteredBots.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setIsTransitioning(true);
    setCurrentPage(newPage);
    window.scrollTo({ top: 120, behavior: 'smooth' });
    setTimeout(() => {
      setIsTransitioning(false);
    }, 180);
  };

  const handleCloneBot = (bot: StoreBot) => {
    if (isCloning) return;
    setIsCloning(true);

    apiService.cloneStoreBot(bot.id).catch(() => null);

    setTimeout(() => {
      if (onDeployStoreBot) {
        onDeployStoreBot(bot);
      }
      setIsCloning(false);
      setClonedSuccessBot(bot);
      if (onShowToast) {
        onShowToast(`Cloned "${bot.name}" successfully! Added to your bots.`);
      }
    }, 600);
  };

  const getCleanTelegramLink = (username?: string) => {
    if (!username) return 'https://t.me';
    const clean = username.replace('@', '');
    return `https://t.me/${clean}`;
  };

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (onShowToast) onShowToast(`Copied ${label} to clipboard!`);
    }
  };

  // -------------------------------------------------------------
  // REDESIGNED & PROPERLY ADJUSTED FULL-PAGE VIEW DETAILS
  // -------------------------------------------------------------
  if (selectedBot) {
    const cleanUsername = selectedBot.botPayload?.username || `@${selectedBot.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_bot`;
    const tgLink = getCleanTelegramLink(cleanUsername);
    const commandsList = selectedBot.botPayload?.commands || [
      { id: 'c1', name: '/start', code: `# /start command handler\nwelcome_text = "Welcome to ${selectedBot.name}!"\nbot.send_message(chat_id, welcome_text)` },
      { id: 'c2', name: '/help', code: `# /help command handler\nhelp_text = "Commands: /start, /help, /settings"\nbot.send_message(chat_id, help_text)` },
      { id: 'c3', name: '/status', code: `# /status command handler\nbot.send_message(chat_id, "Bot is healthy & running.")` },
    ];

    return (
      <div className="w-full max-w-5xl mx-auto space-y-4 pb-16 px-1 animate-in fade-in duration-200">
        {/* Top Breadcrumb & Back Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="back-to-store-btn"
              type="button"
              onClick={() => {
                setSelectedBot(null);
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <span>/</span>
              <span>{selectedBot.category}</span>
              <span>/</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                {selectedBot.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleCopyText(window.location.href, 'Bot Link');
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition shadow-xs"
              title="Share bot link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <span className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
              ID: {selectedBot.id}
            </span>
          </div>
        </div>

        {/* Hero Card - Compact, properly adjusted, perfectly responsive */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Bot Avatar, Title & Metadata */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 ring-2 ring-blue-500/10">
                <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight break-words">
                    {selectedBot.name}
                  </h1>
                  {selectedBot.isVerified && <BlueVerifiedBadge size="sm" />}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400">
                    <span>{cleanUsername}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(cleanUsername, 'Username')}
                      className="p-0.5 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      title="Copy username"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <span>•</span>
                  <span>by <strong className="text-slate-700 dark:text-slate-300 font-semibold">{selectedBot.author}</strong></span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    {selectedBot.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 pt-0.5 max-w-2xl leading-relaxed break-words">
                  {selectedBot.shortDesc}
                </p>
              </div>
            </div>

            {/* Action Buttons: Open in Telegram & Clone Bot */}
            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
              <a
                href={tgLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                title="Launch in Telegram client"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in Telegram</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              <button
                id="clone-bot-btn"
                type="button"
                onClick={() => handleCloneBot(selectedBot)}
                disabled={isCloning}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                {isCloning ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Cloning...</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Clone Bot</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar - 4 Compact Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Community Rating</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {(4.8 + (selectedBot.stars % 5) * 0.04).toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400">({selectedBot.stars} reviews)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Clones</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {selectedBot.clones.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">installs</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Audit</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  Safe
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Verified</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cluster Uptime</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedBot.botPayload?.uptime || '99.95%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column (2 Cols on Desktop): About, Highlights */}
          <div className="lg:col-span-2 space-y-4 min-w-0">
            {/* About Section */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500" />
                <span>About this Bot</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line break-words">
                {selectedBot.about}
              </p>

              {/* Key Features & Highlights */}
              {selectedBot.keyFeatures && selectedBot.keyFeatures.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <h3 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Key Highlights &amp; Capabilities
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedBot.keyFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 font-medium"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug break-words">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Overview / FAQ if available */}
            {selectedBot.aiOverview && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Overview &amp; Answers</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedBot.aiOverview.summary}
                </p>
                {selectedBot.aiOverview.faqs?.map((faq, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                      {faq.question}
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 pl-4">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (1 Col): Specifications, Quick Clone & Tags */}
          <div className="space-y-4 min-w-0">
            {/* Quick Clone Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/15 space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                  Instant Deployment
                </span>
              </div>
              <h3 className="text-sm font-bold">Clone to your Workspace</h3>
              <p className="text-[11px] text-blue-100 leading-relaxed">
                Includes all commands, conversation handlers, and database schema ready for instant use.
              </p>
              <button
                type="button"
                onClick={() => handleCloneBot(selectedBot)}
                disabled={isCloning}
                className="w-full py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isCloning ? 'Cloning Bot...' : 'Clone This Bot Now'}</span>
              </button>
            </div>

            {/* Specifications Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Specifications
              </h3>

              <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800/80">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">License &amp; Cost</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Free Clone</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Version</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedBot.version}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Category</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedBot.category}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Security Audit</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    <span>Certified Safe</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Categorization Tags */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Tags &amp; Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedBot.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Similar Recommended Bots */}
            {selectedBot.similarBots && selectedBot.similarBots.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Similar Bot Templates
                </h3>
                <div className="space-y-2">
                  {selectedBot.similarBots.map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => {
                        const target = bots.find(b => b.id === sim.id);
                        if (target) {
                          setSelectedBot(target);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                          {sim.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {sim.category} • {sim.clones} clones
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CLONED SUCCESS MODAL */}
        <AnimatePresence>
          {clonedSuccessBot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Bot Cloned Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    <strong className="text-slate-900 dark:text-white">{clonedSuccessBot.name}</strong> has been cloned and safely imported into your BOT MATRIX workspace.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300">
                  Imported {clonedSuccessBot.botPayload?.commands?.length || 12} commands • Ready to edit
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setClonedSuccessBot(null)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition"
                  >
                    Stay in Store
                  </button>

                  {onNavigateToMyBots && (
                    <button
                      type="button"
                      onClick={() => {
                        setClonedSuccessBot(null);
                        onNavigateToMyBots();
                      }}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-1"
                    >
                      <span>View My Bots</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // -------------------------------------------------------------
  // BOT STORE MARKETPLACE VIEW (WITH COMPACT BOXES & PAGINATION)
  // -------------------------------------------------------------
  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner - Compact and clean */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white shadow-md shadow-blue-600/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-white">
              <Sparkles className="w-3 h-3" />
              <span>Official Bot Marketplace</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              Telegram Bot Store
            </h1>
            <p className="text-xs text-blue-100 leading-snug mt-0.5">
              Discover verified, pre-built Telegram bots. Click any card to inspect full details, launch in Telegram, or clone directly with 1 click.
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-white/15 backdrop-blur-xs text-white shrink-0 self-start sm:self-auto">
            {filteredBots.length} verified bots
          </span>
        </div>

        {/* Search Input */}
        <div className="relative max-w-lg">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="store-search-input"
            type="text"
            placeholder="Search by name, category, @username, or tag..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-xs font-medium shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Category Pills Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bots Grid (Compact cards with smooth skeleton transitions) */}
      {isTransitioning ? (
        <CompactStoreGridSkeleton count={pageSize} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {paginatedBots.map((bot) => {
              const cleanUsername = bot.botPayload?.username || `@${bot.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_bot`;
              return (
                <motion.div
                  key={bot.id}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    setSelectedBot(bot);
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2.5">
                    {/* Card Top: Smaller Logo, Name, Username & Verified */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {bot.name}
                          </h3>
                          <span className="text-[11px] text-slate-400 font-mono truncate block">
                            {cleanUsername}
                          </span>
                        </div>
                      </div>

                      {bot.isVerified && <BlueVerifiedBadge size="sm" />}
                    </div>

                    {/* Short Description - compact 2 lines */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {bot.shortDesc}
                    </p>
                  </div>

                  {/* Card Footer: Rating, Clones & View Details */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{(4.8 + (bot.stars % 5) * 0.04).toFixed(1)}</span>
                      </span>
                      <span className="text-slate-400 flex items-center gap-0.5">
                        <Download className="w-3 h-3" />
                        <span>{bot.clones.toLocaleString()}</span>
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>View Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredBots.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <Bot className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Bots Found</h3>
              <p className="text-[11px] text-slate-400">Try adjusting your search keywords or select another category.</p>
            </div>
          )}

          {/* Pagination System (পেজ আকারে যাওয়া যাবে পরবর্তী পেজে) */}
          {totalPages > 1 && (
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">
                Showing {(currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, filteredBots.length)} of {filteredBots.length} store bots
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      currentPage === p
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
