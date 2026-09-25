import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  Check,
  X,
  Bot,
  ShieldCheck,
  Users,
  AlertTriangle,
  FileJson,
  Eye,
  Plus,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Activity,
  Server,
  Lock,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { BotItem } from '../types';
import { DatabaseTableSkeleton } from './SkeletonScreen';

interface BotDatabaseViewProps {
  bot: BotItem;
  onUpdateBot?: (updated: BotItem) => void;
  showToast: (msg: string) => void;
}

export interface BotDataField {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'System Config' | 'Network' | 'Runtime State' | 'Custom Variable';
  lastUpdated: string;
}

export interface AdminDataField {
  id: string;
  telegramId: string;
  username: string;
  displayName: string;
  role: 'Super Admin' | 'Cluster Manager' | 'Moderator' | 'Auditor';
  permissions: string[];
  balanceUsdt: number;
  joinedAt: string;
  lastActive: string;
  status: 'active' | 'suspended';
}

export const BotDatabaseView: React.FC<BotDatabaseViewProps> = ({
  bot,
  showToast,
}) => {
  // Main tabs: 'bot_data' and 'admin_data' (100% English)
  const [activeTab, setActiveTab] = useState<'bot_data' | 'admin_data'>('bot_data');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination states
  const [botDataPage, setBotDataPage] = useState(1);
  const [botDataPageSize, setBotDataPageSize] = useState(10);
  const [adminDataPage, setAdminDataPage] = useState(1);
  const [adminDataPageSize, setAdminDataPageSize] = useState(10);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleBotPageChange = (page: number) => {
    setIsTransitioning(true);
    setBotDataPage(page);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  const handleBotPageSizeChange = (size: number) => {
    setIsTransitioning(true);
    setBotDataPageSize(size);
    setBotDataPage(1);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  const handleAdminPageChange = (page: number) => {
    setIsTransitioning(true);
    setAdminDataPage(page);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  const handleAdminPageSizeChange = (size: number) => {
    setIsTransitioning(true);
    setAdminDataPageSize(size);
    setAdminDataPage(1);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  // Initial Bot Data records
  const [botDataList, setBotDataList] = useState<BotDataField[]>([
    {
      id: 'bd-1',
      key: 'bot_identifier_id',
      value: bot.botNumericId || bot.id,
      type: 'string',
      category: 'System Config',
      lastUpdated: 'Live Active',
    },
    {
      id: 'bd-2',
      key: 'webhook_url',
      value: bot.webhookUrl || `https://api.telebotcreator.io/v1/webhook/${bot.id}`,
      type: 'string',
      category: 'Network',
      lastUpdated: 'Synchronized',
    },
    {
      id: 'bd-3',
      key: 'welcome_message',
      value: `Welcome to ${bot.name}! Your automated Telegram assistant is online.`,
      type: 'string',
      category: 'Runtime State',
      lastUpdated: '10 mins ago',
    },
    {
      id: 'bd-4',
      key: 'allocated_storage_kb',
      value: '48.5',
      type: 'number',
      category: 'System Config',
      lastUpdated: 'Just now',
    },
    {
      id: 'bd-5',
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      category: 'Runtime State',
      lastUpdated: '1 hour ago',
    },
    {
      id: 'bd-6',
      key: 'worker_pool_node',
      value: 'Cluster-Worker-Node-07',
      type: 'string',
      category: 'Network',
      lastUpdated: 'Connected',
    },
    {
      id: 'bd-7',
      key: 'referral_bonus_amount',
      value: '0.25',
      type: 'number',
      category: 'Custom Variable',
      lastUpdated: 'Yesterday',
    },
    {
      id: 'bd-8',
      key: 'max_rate_limit_per_min',
      value: '60',
      type: 'number',
      category: 'System Config',
      lastUpdated: 'Permanent Rule',
    },
    {
      id: 'bd-9',
      key: 'session_token_ttl_seconds',
      value: '86400',
      type: 'number',
      category: 'System Config',
      lastUpdated: '3 days ago',
    },
    {
      id: 'bd-10',
      key: 'cluster_sync_interval_ms',
      value: '1500',
      type: 'number',
      category: 'Network',
      lastUpdated: '5 days ago',
    },
    {
      id: 'bd-11',
      key: 'custom_metadata_json',
      value: '{"region":"eu-central-1","failover":true,"max_concurrency":250}',
      type: 'json',
      category: 'Custom Variable',
      lastUpdated: '1 week ago',
    },
    {
      id: 'bd-12',
      key: 'broadcast_auto_throttle',
      value: 'true',
      type: 'boolean',
      category: 'Runtime State',
      lastUpdated: 'Just now',
    },
  ]);

  // Initial Admin Data records
  const [adminDataList, setAdminDataList] = useState<AdminDataField[]>([
    {
      id: 'ad-1',
      telegramId: '61829103',
      username: '@admin_super_vance',
      displayName: 'Alex Vance',
      role: 'Super Admin',
      permissions: ['ALL_PERMISSIONS', 'BOT_DELETE', 'BROADCAST_OVERRIDE', 'BALANCE_MANAGE'],
      balanceUsdt: 125.50,
      joinedAt: '2026-01-10',
      lastActive: 'Just now',
      status: 'active',
    },
    {
      id: 'ad-2',
      telegramId: '19827364',
      username: '@farhan_core',
      displayName: 'Farhan Ahmed',
      role: 'Cluster Manager',
      permissions: ['BROADCAST_CREATE', 'AUDIENCE_BLOCK', 'COMMAND_EDIT'],
      balanceUsdt: 42.00,
      joinedAt: '2026-01-15',
      lastActive: '12 mins ago',
      status: 'active',
    },
    {
      id: 'ad-3',
      telegramId: '47281902',
      username: '@elena_moderator',
      displayName: 'Elena Rostova',
      role: 'Moderator',
      permissions: ['AUDIENCE_BLOCK', 'SUPPORT_REPLY'],
      balanceUsdt: 15.00,
      joinedAt: '2026-02-01',
      lastActive: '1 hour ago',
      status: 'active',
    },
    {
      id: 'ad-4',
      telegramId: '91823719',
      username: '@rahim_security',
      displayName: 'Rahim Chowdhury',
      role: 'Auditor',
      permissions: ['AUDIT_LOG_READ', 'RECORDS_VIEW'],
      balanceUsdt: 0.00,
      joinedAt: '2026-02-18',
      lastActive: 'Yesterday',
      status: 'active',
    },
    {
      id: 'ad-5',
      telegramId: '58291043',
      username: '@dev_ops_backup',
      displayName: 'Cluster Backup Bot Admin',
      role: 'Cluster Manager',
      permissions: ['BACKUP_RESTORE', 'DATABASE_EXPORT'],
      balanceUsdt: 8.50,
      joinedAt: '2026-02-25',
      lastActive: '3 days ago',
      status: 'active',
    },
  ]);

  // Modal States
  const [editingBotItem, setEditingBotItem] = useState<BotDataField | null>(null);
  const [editingAdminItem, setEditingAdminItem] = useState<AdminDataField | null>(null);
  const [isAddingBotItem, setIsAddingBotItem] = useState(false);
  const [isAddingAdminItem, setIsAddingAdminItem] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'bot_data' | 'admin_data';
    id: string;
    label: string;
  } | null>(null);
  const [viewingJsonRecord, setViewingJsonRecord] = useState<any | null>(null);

  // New Bot Item Form
  const [newBotKey, setNewBotKey] = useState('');
  const [newBotValue, setNewBotValue] = useState('');
  const [newBotType, setNewBotType] = useState<BotDataField['type']>('string');
  const [newBotCategory, setNewBotCategory] = useState<BotDataField['category']>('System Config');

  // New Admin Item Form
  const [newAdminTgId, setNewAdminTgId] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminDisplayName, setNewAdminDisplayName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminDataField['role']>('Moderator');

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Database records synchronized successfully.');
    }, 400);
  };

  // Copy Key/Value to clipboard
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`Copied ${label} to clipboard`);
  };

  // Save Bot Item Edit
  const handleSaveBotItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBotItem) return;

    setBotDataList((prev) =>
      prev.map((item) =>
        item.id === editingBotItem.id
          ? { ...editingBotItem, lastUpdated: 'Just now' }
          : item
      )
    );
    showToast(`Updated field "${editingBotItem.key}" successfully.`);
    setEditingBotItem(null);
  };

  // Save Admin Item Edit
  const handleSaveAdminItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdminItem) return;

    setAdminDataList((prev) =>
      prev.map((item) =>
        item.id === editingAdminItem.id ? editingAdminItem : item
      )
    );
    showToast(`Updated admin "${editingAdminItem.username}" successfully.`);
    setEditingAdminItem(null);
  };

  // Add new bot data item
  const handleAddBotItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotKey.trim()) return;

    const newItem: BotDataField = {
      id: `bd-${Date.now()}`,
      key: newBotKey.trim().toLowerCase().replace(/\s+/g, '_'),
      value: newBotValue,
      type: newBotType,
      category: newBotCategory,
      lastUpdated: 'Just now',
    };

    setBotDataList((prev) => [newItem, ...prev]);
    showToast(`Added data field "${newItem.key}" to database.`);
    setNewBotKey('');
    setNewBotValue('');
    setIsAddingBotItem(false);
  };

  // Add new admin item
  const handleAddAdminItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminTgId.trim() || !newAdminUsername.trim()) return;

    const cleanHandle = newAdminUsername.startsWith('@')
      ? newAdminUsername
      : `@${newAdminUsername}`;

    const newAdmin: AdminDataField = {
      id: `ad-${Date.now()}`,
      telegramId: newAdminTgId.trim(),
      username: cleanHandle,
      displayName: newAdminDisplayName.trim() || cleanHandle,
      role: newAdminRole,
      permissions:
        newAdminRole === 'Super Admin'
          ? ['ALL_PERMISSIONS']
          : newAdminRole === 'Cluster Manager'
          ? ['BROADCAST_CREATE', 'COMMAND_EDIT', 'AUDIENCE_BLOCK']
          : ['AUDIENCE_BLOCK', 'SUPPORT_REPLY'],
      balanceUsdt: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
      status: 'active',
    };

    setAdminDataList((prev) => [newAdmin, ...prev]);
    showToast(`Added admin privilege for "${newAdmin.displayName}".`);
    setNewAdminTgId('');
    setNewAdminUsername('');
    setNewAdminDisplayName('');
    setIsAddingAdminItem(false);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'bot_data') {
      setBotDataList((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      showToast(`Deleted "${itemToDelete.label}" from bot data.`);
    } else {
      setAdminDataList((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      showToast(`Removed admin privileges for "${itemToDelete.label}".`);
    }
    setItemToDelete(null);
  };

  // Filtered lists
  const filteredBotData = useMemo(() => {
    return botDataList.filter((item) => {
      const matchesSearch =
        item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      return true;
    });
  }, [botDataList, searchQuery, categoryFilter]);

  const filteredAdminData = useMemo(() => {
    return adminDataList.filter((item) => {
      const matchesSearch =
        item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.telegramId.includes(searchQuery) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (categoryFilter !== 'All' && item.role !== categoryFilter) return false;
      return true;
    });
  }, [adminDataList, searchQuery, categoryFilter]);

  // Pagination for Bot Data
  const totalBotPages = Math.max(1, Math.ceil(filteredBotData.length / botDataPageSize));
  const safeBotPage = Math.min(Math.max(1, botDataPage), totalBotPages);
  const startBotIndex = (safeBotPage - 1) * botDataPageSize;
  const paginatedBotData = filteredBotData.slice(
    startBotIndex,
    startBotIndex + botDataPageSize
  );

  // Pagination for Admin Data
  const totalAdminPages = Math.max(1, Math.ceil(filteredAdminData.length / adminDataPageSize));
  const safeAdminPage = Math.min(Math.max(1, adminDataPage), totalAdminPages);
  const startAdminIndex = (safeAdminPage - 1) * adminDataPageSize;
  const paginatedAdminData = filteredAdminData.slice(
    startAdminIndex,
    startAdminIndex + adminDataPageSize
  );

  return (
    <div className="glass-panel p-5 sm:p-7 rounded-3xl space-y-6">
      {/* Top Telemetry Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0 ring-1 ring-white/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Database Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Node
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-performance KV runtime storage for <strong className="text-slate-800 dark:text-slate-200">{bot.name}</strong> ({bot.username}).
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'bot_data' ? (
            <button
              type="button"
              onClick={() => setIsAddingBotItem(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shadow-blue-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bot Data</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingAdminItem(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Admin Data</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Modern High-Performance Telemetry Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cluster Latency</span>
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-slate-900 dark:text-white font-mono">0.8 ms</span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Optimal</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Records</span>
            <HardDrive className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-slate-900 dark:text-white font-mono">
              {botDataList.length + adminDataList.length}
            </span>
            <span className="text-[10px] font-medium text-slate-400">entries</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Storage Quota</span>
            <Server className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-slate-900 dark:text-white font-mono">1.84 MB</span>
            <span className="text-[10px] font-medium text-slate-400">/ 50 MB</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Encryption</span>
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-slate-900 dark:text-white font-mono">AES-256</span>
            <span className="text-[10px] font-semibold text-blue-500">Secured</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Strictly English Tabs: Bot Data & Admin Data */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('bot_data');
              setCategoryFilter('All');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'bot_data'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Bot Data</span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold">
              {botDataList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin_data');
              setCategoryFilter('All');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'admin_data'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Data</span>
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
              {adminDataList.length}
            </span>
          </button>
        </div>

        {/* Right: Category filter & Search Input */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'bot_data' && (
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setBotDataPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="System Config">System Config</option>
              <option value="Network">Network</option>
              <option value="Runtime State">Runtime State</option>
              <option value="Custom Variable">Custom Variable</option>
            </select>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'bot_data'
                  ? 'Search key, value, category...'
                  : 'Search username, ID, role...'
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setBotDataPage(1);
                setAdminDataPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SECTION 1: BOT DATA TABLE (WITH ADVANCED PAGINATION)            */}
      {/* ============================================================= */}
      {activeTab === 'bot_data' && (
        <div className="space-y-3">
          {isTransitioning ? (
            <DatabaseTableSkeleton rows={Math.min(botDataPageSize, 8)} />
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 pl-4">Key Name</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Current Value</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                    {paginatedBotData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No matching bot data fields found.
                        </td>
                      </tr>
                    ) : (
                      paginatedBotData.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="p-3.5 pl-4 font-mono font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <span>{item.key}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(item.key, 'key name')}
                                className="text-slate-400 hover:text-blue-500 opacity-60 hover:opacity-100 transition-opacity"
                                title="Copy Key"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider ${
                                item.type === 'number'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                                  : item.type === 'boolean'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                  : item.type === 'json'
                                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800'
                                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>

                          <td className="p-3.5 text-slate-500 font-medium">
                            {item.category}
                          </td>

                          <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 max-w-[280px] truncate">
                            {item.value}
                          </td>

                          <td className="p-3.5 text-[11px] text-slate-400 font-medium">
                            {item.lastUpdated}
                          </td>

                          <td className="p-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setViewingJsonRecord(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                title="Inspect JSON"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingBotItem({ ...item })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Field"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setItemToDelete({
                                    type: 'bot_data',
                                    id: item.id,
                                    label: item.key,
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                title="Delete Field"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bot Data Pagination Controls */}
          {totalBotPages > 1 && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>
                  Showing {startBotIndex + 1}–{Math.min(startBotIndex + botDataPageSize, filteredBotData.length)} of {filteredBotData.length} records
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-[11px]">Rows</span>
                <select
                  value={botDataPageSize}
                  onChange={(e) => handleBotPageSizeChange(Number(e.target.value))}
                  className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                >
                  {[10, 25, 50, 100].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleBotPageChange(1)}
                  disabled={safeBotPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleBotPageChange(safeBotPage - 1)}
                  disabled={safeBotPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                  {safeBotPage} / {totalBotPages}
                </span>
                <button
                  type="button"
                  onClick={() => handleBotPageChange(safeBotPage + 1)}
                  disabled={safeBotPage === totalBotPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleBotPageChange(totalBotPages)}
                  disabled={safeBotPage === totalBotPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 2: ADMIN DATA TABLE (WITH ADVANCED PAGINATION)          */}
      {/* ============================================================= */}
      {activeTab === 'admin_data' && (
        <div className="space-y-3">
          {isTransitioning ? (
            <DatabaseTableSkeleton rows={Math.min(adminDataPageSize, 8)} />
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 pl-4">Admin Identity</th>
                      <th className="p-3.5">Telegram ID</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Privileges</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Last Active</th>
                      <th className="p-3.5 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                    {paginatedAdminData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No matching admin records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedAdminData.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="p-3.5 pl-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {item.displayName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">
                                  {item.displayName}
                                </span>
                                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono block">
                                  {item.username}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {item.telegramId}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                item.role === 'Super Admin'
                                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                                  : item.role === 'Cluster Manager'
                                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              }`}
                            >
                              {item.role}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {item.permissions.slice(0, 2).map((perm, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-mono text-slate-600 dark:text-slate-300"
                                >
                                  {perm}
                                </span>
                              ))}
                              {item.permissions.length > 2 && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  +{item.permissions.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                item.status === 'active'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-slate-400 font-medium">
                            {item.lastActive}
                          </td>

                          <td className="p-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setViewingJsonRecord(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                title="Inspect JSON"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingAdminItem({ ...item })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Admin"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setItemToDelete({
                                    type: 'admin_data',
                                    id: item.id,
                                    label: `${item.displayName} (${item.username})`,
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                title="Delete Admin"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Data Pagination Controls */}
          {totalAdminPages > 1 && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>
                  Showing {startAdminIndex + 1}–{Math.min(startAdminIndex + adminDataPageSize, filteredAdminData.length)} of {filteredAdminData.length} admins
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-[11px]">Rows</span>
                <select
                  value={adminDataPageSize}
                  onChange={(e) => handleAdminPageSizeChange(Number(e.target.value))}
                  className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                >
                  {[10, 25, 50, 100].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleAdminPageChange(1)}
                  disabled={safeAdminPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminPageChange(safeAdminPage - 1)}
                  disabled={safeAdminPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                  {safeAdminPage} / {totalAdminPages}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdminPageChange(safeAdminPage + 1)}
                  disabled={safeAdminPage === totalAdminPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminPageChange(totalAdminPages)}
                  disabled={safeAdminPage === totalAdminPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 1: ADD BOT DATA FIELD                                    */}
      {/* ============================================================= */}
      <AnimatePresence>
        {isAddingBotItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Add Bot Data Field
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingBotItem(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddBotItem} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Key Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. welcome_banner_id"
                    value={newBotKey}
                    onChange={(e) => setNewBotKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Data Type
                    </label>
                    <select
                      value={newBotType}
                      onChange={(e) => setNewBotType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="json">JSON Object</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={newBotCategory}
                      onChange={(e) => setNewBotCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none"
                    >
                      <option value="System Config">System Config</option>
                      <option value="Network">Network</option>
                      <option value="Runtime State">Runtime State</option>
                      <option value="Custom Variable">Custom Variable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Initial Value
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter value..."
                    value={newBotValue}
                    onChange={(e) => setNewBotValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingBotItem(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition shadow-xs"
                  >
                    Save Field
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* MODAL 2: EDIT BOT DATA FIELD                                   */}
      {/* ============================================================= */}
      <AnimatePresence>
        {editingBotItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Edit Bot Data Field
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingBotItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBotItemEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={editingBotItem.key}
                    onChange={(e) =>
                      setEditingBotItem({ ...editingBotItem, key: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Data Type
                    </label>
                    <select
                      value={editingBotItem.type}
                      onChange={(e) =>
                        setEditingBotItem({ ...editingBotItem, type: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="json">JSON Object</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={editingBotItem.category}
                      onChange={(e) =>
                        setEditingBotItem({ ...editingBotItem, category: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none"
                    >
                      <option value="System Config">System Config</option>
                      <option value="Network">Network</option>
                      <option value="Runtime State">Runtime State</option>
                      <option value="Custom Variable">Custom Variable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Value
                  </label>
                  <textarea
                    rows={3}
                    value={editingBotItem.value}
                    onChange={(e) =>
                      setEditingBotItem({ ...editingBotItem, value: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingBotItem(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* MODAL 3: ADD ADMIN DATA RECORD                                 */}
      {/* ============================================================= */}
      <AnimatePresence>
        {isAddingAdminItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Add Admin Data Record
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingAdminItem(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddAdminItem} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Telegram Numeric ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 689234120"
                    value={newAdminTgId}
                    onChange={(e) => setNewAdminTgId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Telegram @Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @bot_admin_alex"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Vance"
                    value={newAdminDisplayName}
                    onChange={(e) => setNewAdminDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Administrative Role
                  </label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Cluster Manager">Cluster Manager</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAdminItem(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition shadow-xs"
                  >
                    Save Admin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* MODAL 4: EDIT ADMIN DATA RECORD                                */}
      {/* ============================================================= */}
      <AnimatePresence>
        {editingAdminItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Edit Admin Record
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingAdminItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAdminItemEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editingAdminItem.displayName}
                    onChange={(e) =>
                      setEditingAdminItem({ ...editingAdminItem, displayName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Telegram @Username
                  </label>
                  <input
                    type="text"
                    value={editingAdminItem.username}
                    onChange={(e) =>
                      setEditingAdminItem({ ...editingAdminItem, username: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Role
                    </label>
                    <select
                      value={editingAdminItem.role}
                      onChange={(e) =>
                        setEditingAdminItem({ ...editingAdminItem, role: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Cluster Manager">Cluster Manager</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Auditor">Auditor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Status
                    </label>
                    <select
                      value={editingAdminItem.status}
                      onChange={(e) =>
                        setEditingAdminItem({ ...editingAdminItem, status: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingAdminItem(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* MODAL 5: DELETE CONFIRMATION                                   */}
      {/* ============================================================= */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Confirm Deletion
                  </h3>
                  <p className="text-xs text-slate-500">
                    This will permanently remove the record from the database.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 block mb-1">Target Entry</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm break-all">
                  {itemToDelete.label}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-rose-600/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* MODAL 6: JSON RECORD INSPECTOR                                 */}
      {/* ============================================================= */}
      <AnimatePresence>
        {viewingJsonRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Record Inspector (JSON)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingJsonRecord(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
                {JSON.stringify(viewingJsonRecord, null, 2)}
              </pre>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyText(JSON.stringify(viewingJsonRecord, null, 2), 'JSON')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingJsonRecord(null)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
