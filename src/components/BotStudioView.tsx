import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Bot,
  ExternalLink,
  Copy,
  Check,
  Play,
  Square,
  Sparkles,
  Terminal,
  Search,
  AlertTriangle,
  Sliders,
  Settings,
  Plus,
  Pin,
  Folder,
  Trash2,
  Clock,
  Code2,
  Download,
  Upload,
  RefreshCw,
  X,
  FileText,
  Eye,
  EyeOff,
  Zap,
  Globe,
  HelpCircle,
  MessageSquare,
  Users,
  UserPlus,
  Pencil,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  Maximize2,
  Minimize2,
  ArrowUp,
  FolderInput,
  CheckSquare,
  Database,
  Activity,
  Cpu,
  Layers,
  Radio,
  HardDrive,
} from 'lucide-react';
import { BotItem, BotCommand, BotStudioTab, EnvVariable } from '../types';
import { TelebotIDE } from './TelebotIDE';
import { BotChatsView } from './BotChatsView';
import { BotDatabaseView } from './BotDatabaseView';
import { ReplaceAllDiffModal, CommandDiffPreview } from './ReplaceAllDiffModal';
import { DeleteCommandModal } from './DeleteCommandModal';

interface BotStudioViewProps {
  bot: BotItem;
  onBack: () => void;
  onUpdateBot: (updated: BotItem) => void;
  onDeleteBot: (botId: string) => void;
  onCloneBot: (bot: BotItem) => void;
}

export const BotStudioView: React.FC<BotStudioViewProps> = ({
  bot,
  onBack,
  onUpdateBot,
  onDeleteBot,
  onCloneBot,
}) => {
  const [activeTab, setActiveTab] = useState<BotStudioTab>('Intro');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Command management state
  const [commandSearch, setCommandSearch] = useState('');
  const [activeCommand, setActiveCommand] = useState<BotCommand | null>(null);
  const [showNewCommandModal, setShowNewCommandModal] = useState(false);
  const [newCommandName, setNewCommandName] = useState('');
  const [newAliasInput, setNewAliasInput] = useState('');
  const [renameInput, setRenameInput] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newFolderInput, setNewFolderInput] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  // Multi-select commands & Deleted Commands Recycle Bin & Folders
  const [selectedCommandIds, setSelectedCommandIds] = useState<string[]>([]);
  const [deletedCommands, setDeletedCommands] = useState<BotCommand[]>([]);
  const [showDeletedCommandsModal, setShowDeletedCommandsModal] = useState(false);
  const [showManageFoldersModal, setShowManageFoldersModal] = useState(false);
  const [botFolders, setBotFolders] = useState<string[]>(['Finance', 'Administration', 'Community', 'Hi']);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [showFolderAssignDropdown, setShowFolderAssignDropdown] = useState(false);

  // Advanced Delete Modal & Replace All Diff Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commandsPendingDelete, setCommandsPendingDelete] = useState<BotCommand[]>([]);
  const [showReplaceAllDiffModal, setShowReplaceAllDiffModal] = useState(false);
  const [diffPreviews, setDiffPreviews] = useState<CommandDiffPreview[]>([]);

  // Scroll window to top on mount or when opening bot studio
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [bot.id]);

  // Horizontal folder scroll ref and function for < and > buttons
  const foldersScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollFolders = (direction: 'left' | 'right') => {
    if (foldersScrollRef.current) {
      foldersScrollRef.current.scrollBy({
        left: direction === 'left' ? -150 : 150,
        behavior: 'smooth',
      });
    }
  };

  // Edit Command Modal state
  const [editingCommand, setEditingCommand] = useState<BotCommand | null>(null);
  const [editCmdName, setEditCmdName] = useState('');
  const [editCmdFolder, setEditCmdFolder] = useState('All');
  const [editCmdPinned, setEditCmdPinned] = useState(false);
  const [editCmdAliases, setEditCmdAliases] = useState<string[]>([]);
  const [newEditAliasInput, setNewEditAliasInput] = useState('');
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
  const [isCreatingNewFolderInModal, setIsCreatingNewFolderInModal] = useState(false);
  const [modalNewFolderInput, setModalNewFolderInput] = useState('');

  // Command container ref & highlighting
  const commandsContainerRef = useRef<HTMLDivElement | null>(null);
  const savedScrollPos = useRef<number>(0);
  const [highlightedCommandId, setHighlightedCommandId] = useState<string | null>(null);

  // Intro tab states
  const [isTokenRevealedInIntro, setIsTokenRevealedInIntro] = useState(false);
  const [isPingTesting, setIsPingTesting] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  // Search tab state
  const [globalCodeSearch, setGlobalCodeSearch] = useState('');
  const [replaceSearchText, setReplaceSearchText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  // Manage tab state
  const [versionInput, setVersionInput] = useState(bot.version || '1.0.0');
  const [envVars, setEnvVars] = useState<EnvVariable[]>(bot.envVars || []);
  const [rawEnvModal, setRawEnvModal] = useState(false);
  const [rawEnvText, setRawEnvText] = useState('');
  const [exportUserFormat, setExportUserFormat] = useState<'json' | 'csv'>('json');
  const [exportBotFormat, setExportBotFormat] = useState<'json' | 'yaml' | 'txt'>('json');
  const [exportIncludeData, setExportIncludeData] = useState(true);
  const [importFormat, setImportFormat] = useState<'json' | 'yaml' | 'txt'>('json');
  const [importPasteText, setImportPasteText] = useState('');
  const [importReplaceExisting, setImportReplaceExisting] = useState(false);

  // Settings tab state
  const [tokenInput, setTokenInput] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
  const [showToken, setShowToken] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Simulation runner output
  const [simOutput, setSimOutput] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Intro tab customization state
  const [botBio, setBotBio] = useState(bot.description || 'Official automated Telegram assistant built with BOT MATRIX.');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(bot.description || 'Official automated Telegram assistant built with BOT MATRIX.');
  const [inlineQueriesEnabled, setInlineQueriesEnabled] = useState(true);
  const [groupPrivacyMode, setGroupPrivacyMode] = useState(true);
  const [autoWelcome, setAutoWelcome] = useState(true);
  const [autoRecovery, setAutoRecovery] = useState(true);
  const [webhookMode, setWebhookMode] = useState<'polling' | 'webhook'>('polling');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showToast(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const commandsList = bot.commands || [];

  // Toggle Bot Working / Stopped with confirmation
  const handleToggleBotWorking = () => {
    const isCurrentlyWorking = bot.status === 'working';
    const nextStatus = isCurrentlyWorking ? 'stopped' : 'working';
    const actionWord = isCurrentlyWorking ? 'Stop' : 'Start';

    setConfirmDialog({
      isOpen: true,
      title: `${actionWord} ${bot.name}?`,
      message: isCurrentlyWorking
        ? `Are you sure you want to stop ${bot.name} (${bot.username})? Polling and webhook response handlers will be suspended immediately.`
        : `Are you sure you want to start ${bot.name} (${bot.username})? The bot will begin accepting messages and dispatching commands.`,
      actionLabel: actionWord,
      isDanger: isCurrentlyWorking,
      onConfirm: () => {
        onUpdateBot({
          ...bot,
          status: nextStatus,
          uptime: nextStatus === 'working' ? '99.98%' : '00:00:00',
        });
        showToast(`Bot ${bot.name} is now ${nextStatus}`);
        setConfirmDialog(null);
      },
    });
  };

  // Commands Handlers
  const handleCreateCommand = (e?: React.FormEvent, openEditorImmediately = false) => {
    if (e) e.preventDefault();
    if (!newCommandName.trim()) return;

    let formatted = newCommandName.trim();
    if (!formatted.startsWith('/') && formatted !== '@' && formatted !== '~' && !formatted.includes(' ')) {
      formatted = '/' + formatted;
    }

    const created: BotCommand = {
      id: `cmd-${Date.now()}`,
      name: formatted,
      code: `# Command: ${formatted}\n# Telebot Python Handler\nimport telebot\n\nchat_id = message.chat.id\nuser_id = message.from_user.id\n\nbot.send_message(chat_id, f"Executing {formatted} for user {user_id}")\n`,
      isPinned: false,
      isAdminOnly: false,
      aliases: [],
      folder: selectedFolder !== 'All' ? selectedFolder : 'All',
      updatedAt: 'Just now',
    };

    const updatedCommands = [created, ...commandsList];
    onUpdateBot({ ...bot, commands: updatedCommands, totalCommands: updatedCommands.length });
    setNewCommandName('');
    setShowNewCommandModal(false);

    if (openEditorImmediately) {
      setActiveCommand(created);
      showToast(`Created ${created.name} and opened editor`);
    } else {
      setHighlightedCommandId(created.id);
      setTimeout(() => setHighlightedCommandId(null), 3500);
      showToast(`Created command ${created.name}`);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 60);
    }
  };

  const handleOpenAdminSetups = () => {
    const adminCmd = commandsList.find((c) => c.name === '/Admin_Setups' || c.name === '/admin');
    if (adminCmd) {
      setActiveCommand(adminCmd);
      setRenameInput(adminCmd.name);
      showToast(`Opened ${adminCmd.name}`);
    } else {
      const newAdmin: BotCommand = {
        id: `cmd-admin-${Date.now()}`,
        name: '/Admin_Setups',
        code: `# Command: /Admin_Setups
# Admin Control Room & System Setups Panel (Python)
import telebot
from telebot import types

user_id = str(message.from_user.id)
admin_list = ["61829103", "5478832701", "15519993"]

# Verify administrator authorization
if user_id not in admin_list:
    bot.send_message(message.chat.id, "🚫 Access Denied! You are not authorized to view Admin setups.")
else:
    markup = types.InlineKeyboardMarkup(row_width=1)
    markup.add(
        types.InlineKeyboardButton("🔧 Channels Setup", callback_data="/channels_setup"),
        types.InlineKeyboardButton("💳 Payment Gateway Setup", callback_data="/setup_payment_gateway"),
        types.InlineKeyboardButton("🎁 Generate Redeem Codes", callback_data="/generateRedeem"),
        types.InlineKeyboardButton("📊 Bot Telemetry & Stats", callback_data="/ckalldata")
    )
    
    panel_text = (
        "⚙️ *Admin System Setups Panel*\n\n"
        "• Gateway: *CryptoBot / XRocket*\n"
        "• Mini App Status: *Active (Online)*\n"
        "• Node Network: *Accelerated MTProto*\n"
        "• Role: *Authorized System Administrator*\n\n"
        "Select a configuration action below:"
    )
    bot.send_message(message.chat.id, panel_text, parse_mode="Markdown", reply_markup=markup)
`,
        isPinned: true,
        isAdminOnly: true,
        aliases: ['/admin', '/setup'],
        folder: 'Administration',
        updatedAt: 'Just now',
      };
      const updatedCommands = [newAdmin, ...commandsList];
      onUpdateBot({ ...bot, commands: updatedCommands, totalCommands: updatedCommands.length });
      setActiveCommand(newAdmin);
      setRenameInput(newAdmin.name);
      showToast('Created and opened /Admin_Setups command');
    }
  };

  const handleSaveCommandCode = (cmd: BotCommand, newCode: string) => {
    const updated = commandsList.map((c) => (c.id === cmd.id ? { ...c, code: newCode, updatedAt: 'Just now' } : c));
    onUpdateBot({ ...bot, commands: updated });
    if (activeCommand && activeCommand.id === cmd.id) {
      setActiveCommand({ ...activeCommand, code: newCode, updatedAt: 'Just now' });
    }
    showToast(`Saved code for ${cmd.name}`);
  };

  const handleOpenDeleteModal = (cmds: BotCommand[]) => {
    if (cmds.length === 0) return;
    setCommandsPendingDelete(cmds);
    setShowDeleteModal(true);
  };

  const handleDeleteCommand = (cmd: BotCommand) => {
    handleOpenDeleteModal([cmd]);
  };

  const handleBulkDeleteCommands = () => {
    const toDelete = commandsList.filter((c) => selectedCommandIds.includes(c.id));
    if (toDelete.length > 0) {
      handleOpenDeleteModal(toDelete);
    }
  };

  const handleConfirmMoveToTrash = () => {
    const ids = commandsPendingDelete.map((c) => c.id);
    const remaining = commandsList.filter((c) => !ids.includes(c.id));
    onUpdateBot({ ...bot, commands: remaining, totalCommands: remaining.length });
    setDeletedCommands((prev) => [...commandsPendingDelete, ...prev]);
    setSelectedCommandIds((prev) => prev.filter((id) => !ids.includes(id)));
    if (activeCommand && ids.includes(activeCommand.id)) {
      setActiveCommand(null);
    }
    setShowDeleteModal(false);
    showToast(`Moved ${commandsPendingDelete.length} command(s) to Deleted Commands`);
    setCommandsPendingDelete([]);
  };

  const handleConfirmPermanentDelete = () => {
    const ids = commandsPendingDelete.map((c) => c.id);
    const remaining = commandsList.filter((c) => !ids.includes(c.id));
    onUpdateBot({ ...bot, commands: remaining, totalCommands: remaining.length });
    setSelectedCommandIds((prev) => prev.filter((id) => !ids.includes(id)));
    if (activeCommand && ids.includes(activeCommand.id)) {
      setActiveCommand(null);
    }
    setShowDeleteModal(false);
    showToast(`Permanently deleted ${commandsPendingDelete.length} command(s)`);
    setCommandsPendingDelete([]);
  };

  const handleBatchMoveToFolder = (targetFolder: string) => {
    if (selectedCommandIds.length === 0) return;
    const updated = commandsList.map((c) =>
      selectedCommandIds.includes(c.id) ? { ...c, folder: targetFolder } : c
    );
    onUpdateBot({ ...bot, commands: updated });
    showToast(`Moved ${selectedCommandIds.length} command(s) to "${targetFolder}"`);
    setShowFolderAssignDropdown(false);
  };

  const handleRestoreCommand = (cmd: BotCommand) => {
    setDeletedCommands((prev) => prev.filter((c) => c.id !== cmd.id));
    const updated = [cmd, ...commandsList];
    onUpdateBot({ ...bot, commands: updated, totalCommands: updated.length });
    showToast(`Restored command ${cmd.name}`);
  };

  const handlePermanentlyDeleteCommand = (cmdId: string) => {
    setDeletedCommands((prev) => prev.filter((c) => c.id !== cmdId));
    showToast('Permanently removed command');
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderNameInput.trim();
    if (!trimmed) return;
    if (botFolders.includes(trimmed)) {
      showToast('Folder already exists');
      return;
    }
    setBotFolders((prev) => [...prev, trimmed]);
    setNewFolderNameInput('');
    showToast(`Created folder "${trimmed}"`);
  };

  const handleDeleteFolder = (folderName: string) => {
    if (folderName === 'All' || folderName === 'General') {
      showToast('Cannot delete default "All" folder');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: `Delete Folder "${folderName}"?`,
      message: `Are you sure you want to delete folder "${folderName}"? All commands inside this folder will be reassigned to "All".`,
      actionLabel: 'Delete Folder',
      isDanger: true,
      onConfirm: () => {
        setBotFolders((prev) => prev.filter((f) => f !== folderName));
        // Reassign commands in that folder to All
        const updated = commandsList.map((c) =>
          c.folder === folderName ? { ...c, folder: 'All' } : c
        );
        onUpdateBot({ ...bot, commands: updated });
        showToast(`Deleted folder "${folderName}"`);
        setConfirmDialog(null);
      },
    });
  };

  const handleRenameCommand = (cmd: BotCommand) => {
    if (!renameInput.trim()) return;
    const updated = commandsList.map((c) => (c.id === cmd.id ? { ...c, name: renameInput.trim() } : c));
    onUpdateBot({ ...bot, commands: updated });
    setActiveCommand({ ...cmd, name: renameInput.trim() });
    setShowRenameModal(false);
    showToast(`Renamed command to ${renameInput.trim()}`);
  };

  const handleAddAlias = (cmd: BotCommand) => {
    if (!newAliasInput.trim()) return;
    const existing = cmd.aliases || [];
    if (existing.length >= 10) {
      showToast('Maximum 10 aliases reached');
      return;
    }
    let alias = newAliasInput.trim();
    if (!alias.startsWith('/')) alias = '/' + alias;
    const updatedAliases = [...existing, alias];
    const updated = commandsList.map((c) => (c.id === cmd.id ? { ...c, aliases: updatedAliases } : c));
    onUpdateBot({ ...bot, commands: updated });
    setActiveCommand({ ...cmd, aliases: updatedAliases });
    setNewAliasInput('');
    showToast(`Added alias ${alias}`);
  };

  const handleRemoveAlias = (cmd: BotCommand, aliasToRemove: string) => {
    const updatedAliases = (cmd.aliases || []).filter((a) => a !== aliasToRemove);
    const updated = commandsList.map((c) => (c.id === cmd.id ? { ...c, aliases: updatedAliases } : c));
    onUpdateBot({ ...bot, commands: updated });
    setActiveCommand({ ...cmd, aliases: updatedAliases });
  };

  const handleOpenEditCommandModal = (cmd: BotCommand, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCommand(cmd);
    setEditCmdName(cmd.name);
    const resolvedFolder = !cmd.folder || cmd.folder === 'General' ? 'All' : cmd.folder;
    setEditCmdFolder(resolvedFolder);
    setEditCmdPinned(!!cmd.isPinned);
    setEditCmdAliases(cmd.aliases ? [...cmd.aliases] : []);
    setNewEditAliasInput('');
    setIsFolderDropdownOpen(false);
    setIsCreatingNewFolderInModal(false);
    setModalNewFolderInput('');
  };

  const handleSaveEditCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingCommand) return;
    const name = editCmdName.trim();
    if (!name) {
      showToast('Command name cannot be empty');
      return;
    }
    const formattedName = name.startsWith('/') ? name : '/' + name;
    let folder = editCmdFolder.trim() || 'All';
    if (folder === 'General') folder = 'All';
    if (folder !== 'All' && !botFolders.includes(folder)) {
      setBotFolders((prev) => [...prev, folder]);
    }
    const updated = commandsList.map((c) =>
      c.id === editingCommand.id
        ? {
            ...c,
            name: formattedName,
            folder: folder,
            isPinned: editCmdPinned,
            aliases: editCmdAliases,
          }
        : c
    );
    onUpdateBot({ ...bot, commands: updated });
    if (activeCommand && activeCommand.id === editingCommand.id) {
      setActiveCommand({
        ...activeCommand,
        name: formattedName,
        folder: folder,
        isPinned: editCmdPinned,
        aliases: editCmdAliases,
      });
    }
    setEditingCommand(null);
    showToast(`Updated command "${formattedName}"`);
  };

  const handleAddEditAlias = () => {
    if (!newEditAliasInput.trim()) return;
    let alias = newEditAliasInput.trim();
    if (!alias.startsWith('/')) alias = '/' + alias;
    if (editCmdAliases.includes(alias)) {
      showToast('Alias already added');
      return;
    }
    if (editCmdAliases.length >= 10) {
      showToast('Maximum 10 aliases reached');
      return;
    }
    setEditCmdAliases((prev) => [...prev, alias]);
    setNewEditAliasInput('');
  };

  const handleRemoveEditAlias = (aliasToRemove: string) => {
    setEditCmdAliases((prev) => prev.filter((a) => a !== aliasToRemove));
  };

  const handleToggleCommandPin = (cmd: BotCommand, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextPinned = !cmd.isPinned;
    const updated = commandsList.map((c) => (c.id === cmd.id ? { ...c, isPinned: nextPinned } : c));
    onUpdateBot({ ...bot, commands: updated });
    if (activeCommand && activeCommand.id === cmd.id) {
      setActiveCommand({ ...activeCommand, isPinned: nextPinned });
    }
    showToast(nextPinned ? `📌 Pinned "${cmd.name}" to top` : `Unpinned "${cmd.name}"`);
  };

  // Run Test Simulation
  const handleRunSimulation = (cmdOrName: BotCommand | string) => {
    const cmd =
      typeof cmdOrName === 'string'
        ? commandsList.find((c) => c.name === cmdOrName) || {
            name: cmdOrName,
            code: 'Bot message responder: /start initiated',
          }
        : cmdOrName;
    setSimOutput(
      `🤖 Telegram Simulation for [${cmd.name}]:\n→ Message sent from user @admin (ID: 61829103)\n→ Status: 200 OK (Execution: 14ms)\n→ Result:\n${cmd.code.slice(
        0,
        150
      )}...\n✓ Command dispatched successfully.`
    );
  };

  // Search across all command code
  const searchResults = globalCodeSearch.trim()
    ? commandsList.filter((cmd) => {
        let codeText = cmd.code;
        let query = globalCodeSearch;
        if (!matchCase) {
          codeText = codeText.toLowerCase();
          query = query.toLowerCase();
        }
        return codeText.includes(query) || cmd.name.toLowerCase().includes(query.toLowerCase());
      })
    : [];

  const handlePrepareReplaceAll = () => {
    if (!globalCodeSearch.trim()) {
      showToast('Please enter a search query first');
      return;
    }

    const previewsList: CommandDiffPreview[] = [];

    commandsList.forEach((cmd) => {
      const lines = cmd.code.split('\n');
      let commandMatches = 0;
      const diffLines: CommandDiffPreview['diffLines'] = [];
      const newLines: string[] = [];

      lines.forEach((line, idx) => {
        let matchedInLine = false;
        let newLine = line;

        if (useRegex) {
          try {
            const re = new RegExp(globalCodeSearch, matchCase ? 'g' : 'gi');
            if (re.test(line)) {
              matchedInLine = true;
              const matches = line.match(re);
              commandMatches += matches ? matches.length : 1;
              newLine = line.replace(re, replaceSearchText);
            }
          } catch {
            // regex fallback
          }
        } else {
          const query = matchCase ? globalCodeSearch : globalCodeSearch.toLowerCase();
          const target = matchCase ? line : line.toLowerCase();
          if (target.includes(query)) {
            matchedInLine = true;
            if (matchCase) {
              const count = line.split(globalCodeSearch).length - 1;
              commandMatches += count;
              newLine = line.split(globalCodeSearch).join(replaceSearchText);
            } else {
              const re = new RegExp(globalCodeSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
              const matches = line.match(re);
              commandMatches += matches ? matches.length : 1;
              newLine = line.replace(re, replaceSearchText);
            }
          }
        }

        newLines.push(newLine);

        if (matchedInLine) {
          diffLines.push({
            lineNumber: idx + 1,
            original: line,
            replaced: newLine,
          });
        }
      });

      if (commandMatches > 0) {
        previewsList.push({
          command: cmd,
          occurrences: commandMatches,
          originalCode: cmd.code,
          replacedCode: newLines.join('\n'),
          diffLines,
        });
      }
    });

    if (previewsList.length === 0) {
      showToast(`No matches found for "${globalCodeSearch}"`);
      return;
    }

    setDiffPreviews(previewsList);
    setShowReplaceAllDiffModal(true);
  };

  const handleApplyReplaceAll = (selectedIds: string[]) => {
    const previewsMap = new Map(
      diffPreviews
        .filter((p) => selectedIds.includes(p.command.id))
        .map((p) => [p.command.id, p.replacedCode])
    );

    const updated = commandsList.map((cmd) => {
      if (previewsMap.has(cmd.id)) {
        return {
          ...cmd,
          code: previewsMap.get(cmd.id)!,
          updatedAt: 'Just now',
        };
      }
      return cmd;
    });

    onUpdateBot({ ...bot, commands: updated });
    setShowReplaceAllDiffModal(false);
    showToast(`Successfully replaced code across ${selectedIds.length} command(s)`);
  };

  const renderHighlightedSnippet = (code: string, query: string, isMatchCase: boolean) => {
    if (!query.trim()) {
      return <span>{code.slice(0, 160)}...</span>;
    }

    const lines = code.split('\n');
    const matchedLineIndices: number[] = [];
    const q = isMatchCase ? query : query.toLowerCase();

    lines.forEach((l, idx) => {
      const target = isMatchCase ? l : l.toLowerCase();
      if (target.includes(q)) {
        matchedLineIndices.push(idx);
      }
    });

    if (matchedLineIndices.length === 0) {
      return <span>{code.slice(0, 160)}...</span>;
    }

    const displayIndices = matchedLineIndices.slice(0, 3);

    return (
      <div className="space-y-1.5 pt-1">
        {displayIndices.map((lineIdx) => {
          const lineText = lines[lineIdx];
          const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, isMatchCase ? 'g' : 'gi');
          const parts = lineText.split(regex);

          return (
            <div key={lineIdx} className="flex items-start gap-2 text-[11px] font-mono leading-relaxed bg-slate-100/70 dark:bg-slate-900/60 p-1.5 rounded-lg overflow-x-auto">
              <span className="text-slate-400 select-none text-[10px] w-6 text-right shrink-0 pt-0.5">
                L{lineIdx + 1}:
              </span>
              <span className="truncate">
                {parts.map((part, pIdx) =>
                  part.toLowerCase() === query.toLowerCase() ? (
                    <mark
                      key={pIdx}
                      className="bg-amber-300 dark:bg-amber-400/40 text-amber-950 dark:text-amber-200 font-bold px-1 rounded mx-0.5"
                    >
                      {part}
                    </mark>
                  ) : (
                    <span key={pIdx}>{part}</span>
                  )
                )}
              </span>
            </div>
          );
        })}
        {matchedLineIndices.length > 3 && (
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block pt-0.5">
            + {matchedLineIndices.length - 3} more matching lines in this command
          </span>
        )}
      </div>
    );
  };

  // Export handlers
  const handleExportUsers = () => {
    const dummyUsers = [
      { id: 1001, username: 'siam_dev', active_date: '2026-09-05', creation_date: '2026-08-10' },
      { id: 1002, username: 'crypto_whale', active_date: '2026-09-04', creation_date: '2026-08-12' },
      { id: 1003, username: 'alex_tg', active_date: '2026-09-05', creation_date: '2026-08-15' },
    ];
    let dataStr = '';
    if (exportUserFormat === 'csv') {
      dataStr = 'data:text/csv;charset=utf-8,id,username,active_date,creation_date\n' +
        dummyUsers.map((u) => `${u.id},${u.username},${u.active_date},${u.creation_date}`).join('\n');
    } else {
      dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dummyUsers, null, 2));
    }
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `${bot.username}_users.${exportUserFormat}`);
    a.click();
    showToast(`Exported users (${exportUserFormat.toUpperCase()})`);
  };

  const handleExportBot = () => {
    const payload = {
      id: bot.botNumericId,
      name: bot.name,
      username: bot.username,
      version: bot.version,
      commands: commandsList.map((c) => ({
        name: c.name,
        code: c.code,
        aliases: c.aliases,
        adminOnly: c.isAdminOnly,
        pinned: c.isPinned,
        folder: c.folder,
      })),
      env: exportIncludeData ? envVars : [],
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `${bot.username}_bot_export.${exportBotFormat}`);
    a.click();
    showToast(`Exported bot package (${exportBotFormat.toUpperCase()})`);
  };

  const handleImportCommands = () => {
    if (!importPasteText.trim()) {
      showToast('Please paste valid JSON/TXT commands');
      return;
    }
    try {
      const parsed = JSON.parse(importPasteText);
      const incomingCmds = Array.isArray(parsed) ? parsed : parsed.commands || [];
      if (incomingCmds.length === 0) {
        showToast('No commands found in JSON');
        return;
      }
      const formatted: BotCommand[] = incomingCmds.map((c: any, idx: number) => ({
        id: `imported-${Date.now()}-${idx}`,
        name: c.name || `/cmd_${idx}`,
        code: c.code || '// imported code\nBot.sendMessage("ok");',
        aliases: c.aliases || [],
        isAdminOnly: !!c.adminOnly,
        isPinned: !!c.pinned,
        folder: c.folder || 'Imported',
        updatedAt: 'Just now',
      }));

      const finalCmds = importReplaceExisting ? formatted : [...formatted, ...commandsList];
      onUpdateBot({ ...bot, commands: finalCmds, totalCommands: finalCmds.length });
      setImportPasteText('');
      showToast(`Successfully imported ${formatted.length} commands!`);
    } catch (err) {
      showToast('Invalid JSON format. Please verify command syntax.');
    }
  };

  // Danger actions
  const handleDeleteBotPrompt = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Permanently Delete ${bot.name}?`,
      message: `Are you sure you want to permanently delete ${bot.name} (${bot.username})? This action CANNOT be undone and will erase all 59 commands, environment variables, and telemetry logs.`,
      actionLabel: 'Delete Bot',
      isDanger: true,
      onConfirm: () => {
        onDeleteBot(bot.id);
        setConfirmDialog(null);
      },
    });
  };

  const handleCloneBotPrompt = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Clone ${bot.name}?`,
      message: `Create an exact duplicate of ${bot.name} with all commands, configuration, and environment variables.`,
      actionLabel: 'Clone Bot',
      isDanger: false,
      onConfirm: () => {
        onCloneBot(bot);
        setConfirmDialog(null);
        showToast(`Successfully cloned ${bot.name}`);
      },
    });
  };

  const handleTransferBotPrompt = () => {
    if (!transferEmail.trim()) {
      showToast('Please enter recipient email address');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: `Transfer Bot Ownership?`,
      message: `Are you sure you want to transfer ${bot.name} to ${transferEmail}? Once confirmed, your ownership will be revoked.`,
      actionLabel: 'Transfer Ownership',
      isDanger: true,
      onConfirm: () => {
        onUpdateBot({ ...bot, status: 'transferred' });
        setConfirmDialog(null);
        showToast(`Bot ownership transfer request sent to ${transferEmail}`);
      },
    });
  };

  const tabs: BotStudioTab[] = [
    'Intro',
    'Commands',
    'Search',
    'Errors',
    'Manage',
    'Chats',
    'Database',
    'Settings',
  ];

  // Full-page Code Editor: When activeCommand is set, render ONLY the editor across the full page
  if (activeCommand) {
    return (
      <TelebotIDE
        key={activeCommand.id}
        initialCommand={activeCommand}
        command={activeCommand}
        allCommands={commandsList}
        botName={bot.name}
        botUsername={bot.username}
        bot={bot}
        onSaveCommand={(commandIdOrObj, updatedCode, metadata) => {
          let updated: BotCommand[];
          let savedName = '';
          if (typeof commandIdOrObj === 'object' && commandIdOrObj !== null) {
            const updatedCmd = commandIdOrObj;
            updated = commandsList.map((c) =>
              c.id === updatedCmd.id ? { ...c, ...updatedCmd } : c
            );
            savedName = updatedCmd.name;
            setActiveCommand(updatedCmd);
          } else {
            const commandId = String(commandIdOrObj);
            updated = commandsList.map((c) =>
              c.id === commandId
                ? { ...c, code: updatedCode, ...(metadata || {}) }
                : c
            );
            const found = updated.find((c) => c.id === commandId);
            savedName = found?.name || 'command';
            if (found) setActiveCommand(found);
          }
          onUpdateBot({ ...bot, commands: updated });
          showToast(`Saved ${savedName}`);
        }}
        onBack={() => {
          setActiveCommand(null);
          setTimeout(() => window.scrollTo({ top: savedScrollPos.current, behavior: 'instant' }), 50);
        }}
        onClose={() => {
          setActiveCommand(null);
          setTimeout(() => window.scrollTo({ top: savedScrollPos.current, behavior: 'instant' }), 50);
        }}
        onRunSimulation={handleRunSimulation}
      />
    );
  }

  return (
    <div className="space-y-5 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl text-xs font-bold border border-slate-700 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog Modal */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-300 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    confirmDialog.isDanger
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {confirmDialog.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {confirmDialog.message}
              </p>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-colors cursor-pointer ${
                    confirmDialog.isDanger
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  }`}
                >
                  {confirmDialog.actionLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sleek Top Navigation Bar with Back Button placed directly in front of Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Tabs: Back Button placed directly in front of Intro */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          {/* Back button directly in front of Intro */}
          <button
            onClick={onBack}
            className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-bold shrink-0"
            title="Back to My Bots"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Back</span>
          </button>

          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== 'Commands') setActiveCommand(null);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab === 'Intro' && <Bot className="w-3.5 h-3.5" />}
              {tab === 'Commands' && <Terminal className="w-3.5 h-3.5" />}
              {tab === 'Search' && <Search className="w-3.5 h-3.5" />}
              {tab === 'Errors' && <AlertTriangle className="w-3.5 h-3.5" />}
              {tab === 'Manage' && <Sliders className="w-3.5 h-3.5" />}
              {tab === 'Chats' && <MessageSquare className="w-3.5 h-3.5" />}
              {tab === 'Database' && <Database className="w-3.5 h-3.5" />}
              {tab === 'Settings' && <Settings className="w-3.5 h-3.5" />}
              <span>{tab}</span>
              {tab === 'Commands' && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 dark:bg-slate-700/60 font-mono">
                  {commandsList.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT 1: INTRO */}
      {activeTab === 'Intro' && (
        <div className="space-y-5">
          {/* Main Bot Hero Info Card */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Ambient Background Accent Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-4 min-w-0">
                {/* Circular bot avatar with online/offline pulse indicator */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                    {bot.photoUrl ? (
                      <img src={bot.photoUrl} alt={bot.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Bot className="w-9 h-9 text-white" />
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                      bot.status === 'working' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                    title={bot.status === 'working' ? 'Online' : 'Stopped'}
                  />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                      {bot.name}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${
                        bot.status === 'working'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${bot.status === 'working' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                      {bot.status === 'working' ? 'Active & Running' : 'Paused / Stopped'}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                      {bot.folder || 'Main Bots'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {bot.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(bot.username, 'Username')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                      title="Copy username"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      ID {bot.botNumericId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(bot.botNumericId, 'Bot ID')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                      title="Copy ID"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Action Controls */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleBotWorking}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-md cursor-pointer transition-all flex items-center gap-2 ${
                    bot.status === 'working'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  }`}
                >
                  {bot.status === 'working' ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Stop Bot</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Bot</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://t.me/${bot.username.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Telegram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* 8 Dedicated Studio Cards: Last active, total command, error, database, manage, search, action, quick action */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Last active */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Last Active</span>
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block font-mono">
                  {bot.lastActive || 'Active now'}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>Gateway latency: 14ms (EU-1)</span>
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Cluster Uptime: {bot.uptime || '99.98%'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Online</span>
              </div>
            </div>

            {/* 2. Total command */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Total Command</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {commandsList.filter((c) => c.isPinned).length} Pinned
                </span>
              </div>
              <div>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block font-mono">
                  {commandsList.length}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Across {botFolders.length} folders &amp; categories
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('Commands')}
                  className="w-full text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>Manage Commands</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* 3. Error */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Error</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  Healthy
                </span>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white block font-mono">
                  {bot.errors?.length || 0}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  {bot.errors && bot.errors.length > 0
                    ? `${bot.errors.length} active exceptions in queue`
                    : '0 runtime exceptions • Clean logs'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('Errors')}
                  className="w-full text-left text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>View Diagnostics &amp; Logs</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* 4. Database */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Database</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                  Active
                </span>
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block font-mono">
                  Connected
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  14,280 keys stored • 42.4 MB
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('Database')}
                  className="w-full text-left text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>Open Database</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* 5. Manage */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-500" />
                  <span>Manage</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                  {bot.version || 'v1.0.0'}
                </span>
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 dark:text-white block">
                  Cluster &amp; Env Vars
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  {envVars.length} variables • Python 3.12 Engine
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('Manage')}
                  className="w-full text-left text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>Manage Bot &amp; Envs</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* 6. Search */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-500" />
                  <span>Search</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">Global IDE</span>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search command code or handler..."
                    value={commandSearch}
                    onChange={(e) => setCommandSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setGlobalCodeSearch(commandSearch);
                        setActiveTab('Search');
                      }
                    }}
                    className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {['/start', 'admin', 'help', 'api'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setGlobalCodeSearch(tag);
                        setActiveTab('Search');
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-950 transition cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setGlobalCodeSearch(commandSearch);
                    setActiveTab('Search');
                  }}
                  className="w-full text-left text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>Open Code Search</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* 7. Total Users (টোটাল ইউজার) */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Total Users</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  +14.8% growth
                </span>
              </div>
              <div>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block font-mono">
                  {(bot.activeUsers ? bot.activeUsers * 11 + 640 : 2150).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Total registered bot users • Live Telegram subscribers
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('Chats')}
                  className="w-full text-left text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>View All Subscribers &amp; Chats</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* 8. Today's New Users (টোটাল নতুন আজকের ইউজার) */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-blue-500" />
                  <span>Today's New Users</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  Last 24h
                </span>
              </div>
              <div>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block font-mono">
                  +{Math.max(14, Math.round((bot.activeUsers || 45) * 0.38))}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  New users joined today • 96.2% conversion rate
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('Chats')}
                  className="w-full text-left text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between cursor-pointer"
                >
                  <span>Open User Growth &amp; Chats</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: COMMANDS (With code editor view when activeCommand is selected) */}
      {/* TAB CONTENT 2: COMMANDS (With TelebotIDE integration & bulk actions) */}
      {activeTab === 'Commands' && (
        <div className="space-y-4">
          {/* Commands List View */}
          <div className="glass-panel p-5 rounded-3xl space-y-4">
              <div className="flex flex-col gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                    {/* Single clean </> icon in front to jump to search */}
                    <button
                      onClick={() => setActiveTab('Search')}
                      title="Jump to code search"
                      className="px-2.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-200 dark:border-blue-900/40 text-xs font-mono font-black transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                    >
                      <span>&lt;/&gt;</span>
                    </button>

                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={commandSearch}
                        onChange={(e) => setCommandSearch(e.target.value)}
                        placeholder="Search commands..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Manage Folders button */}
                    <button
                      onClick={() => setShowManageFoldersModal(true)}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-500" />
                      <span>Manage Folders</span>
                    </button>

                    {/* Deleted Commands (Recycle Bin) */}
                    <button
                      onClick={() => setShowDeletedCommandsModal(true)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                        deletedCommands.length > 0
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Deleted Commands ({deletedCommands.length})</span>
                    </button>

                    {/* Add Command */}
                    <button
                      onClick={() => setShowNewCommandModal(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New</span>
                    </button>
                  </div>
                </div>

                {/* Dedicated Interactive Folder Filter Bar */}
                <div className="flex items-center gap-2 pt-1 overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline-block">
                    Folders
                  </span>

                  <button
                    type="button"
                    onClick={() => scrollFolders('left')}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                    title="Previous folders"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div
                    ref={foldersScrollRef}
                    className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 scroll-smooth"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedFolder('All')}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                        selectedFolder === 'All'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      All ({commandsList.length})
                    </button>
                    {botFolders
                      .filter((f) => f !== 'General' && f !== 'All')
                      .map((f) => {
                        const count = commandsList.filter((c) => (c.folder || 'All') === f).length;
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setSelectedFolder(f)}
                            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                              selectedFolder === f
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            <Folder className="w-3.5 h-3.5" />
                            <span>{f}</span>
                            <span className="text-[10px] opacity-80 font-mono">({count})</span>
                          </button>
                        );
                      })}
                    <button
                      type="button"
                      onClick={() => setShowManageFoldersModal(true)}
                      className="text-xs px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer shrink-0 flex items-center gap-1 border border-dashed border-slate-300 dark:border-slate-700"
                      title="Add or manage folders"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Folder</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollFolders('right')}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                    title="Next folders"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Modern Batch Actions Toolbar */}
                {selectedCommandIds.length > 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-600 text-white shadow-xs flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>{selectedCommandIds.length} Selected</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const filteredIds = commandsList
                            .filter((c) => {
                              const matchesSearch =
                                c.name.toLowerCase().includes(commandSearch.toLowerCase()) ||
                                (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(commandSearch.toLowerCase())));
                              const matchesFolder = selectedFolder === 'All' || (c.folder || 'All') === selectedFolder;
                              return matchesSearch && matchesFolder;
                            })
                            .map((c) => c.id);
                          setSelectedCommandIds(filteredIds);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer transition"
                      >
                        Select All (Filtered)
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedCommandIds([])}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium border border-slate-200 dark:border-slate-700 cursor-pointer transition"
                      >
                        Deselect
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Move to folder dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowFolderAssignDropdown(!showFolderAssignDropdown)}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer transition shadow-xs"
                        >
                          <FolderInput className="w-3.5 h-3.5 text-amber-500" />
                          <span>Move to Folder</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {showFolderAssignDropdown && (
                          <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white dark:bg-[#252526] border border-slate-200 dark:border-[#3e3e42] shadow-xl p-1.5 z-30 space-y-0.5">
                            <button
                              type="button"
                              onClick={() => handleBatchMoveToFolder('All')}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-[#333] text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                            >
                              All (Default)
                            </button>
                            {botFolders.filter((f) => f !== 'All' && f !== 'General').map((f) => (
                              <button
                                key={f}
                                type="button"
                                onClick={() => handleBatchMoveToFolder(f)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-[#333] text-slate-700 dark:text-slate-300 font-medium cursor-pointer flex items-center gap-1.5"
                              >
                                <Folder className="w-3 h-3 text-amber-500" />
                                <span className="truncate">{f}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Delete Selected Button */}
                      <button
                        type="button"
                        onClick={handleBulkDeleteCommands}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-rose-600/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete ({selectedCommandIds.length})</span>
                      </button>

                      {/* Close selection */}
                      <button
                        type="button"
                        onClick={() => setSelectedCommandIds([])}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Exit selection mode"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 pt-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Total commands in bot: <span className="font-mono font-bold text-slate-900 dark:text-white">{commandsList.length}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const filteredIds = commandsList
                          .filter((c) => {
                            const matchesSearch =
                              c.name.toLowerCase().includes(commandSearch.toLowerCase()) ||
                              (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(commandSearch.toLowerCase())));
                            const matchesFolder = selectedFolder === 'All' || (c.folder || 'All') === selectedFolder;
                            return matchesSearch && matchesFolder;
                          })
                          .map((c) => c.id);
                        setSelectedCommandIds(filteredIds);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer flex items-center gap-1"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Select Commands</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile View Mode Bar: Expand / Scroll container toggle & Top anchor */}
              <div className="flex items-center justify-between px-1 py-1 text-xs text-slate-500">
                <span className="text-[11px] font-medium">
                  Showing <strong className="text-slate-700 dark:text-slate-300 font-semibold">{
                    commandsList.filter((c) => {
                      const matchesSearch =
                        c.name.toLowerCase().includes(commandSearch.toLowerCase()) ||
                        (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(commandSearch.toLowerCase())));
                      const matchesFolder = selectedFolder === 'All' || (c.folder || 'All') === selectedFolder;
                      return matchesSearch && matchesFolder;
                    }).length
                  }</strong> of <strong className="text-slate-700 dark:text-slate-300 font-semibold">{commandsList.length}</strong> commands
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Scroll to top of command list"
                  >
                    <ArrowUp className="w-3 h-3" />
                    <span>Top</span>
                  </button>

                </div>
              </div>

              {/* Commands Grid with Checkboxes, Edit and Delete icons (Pinned commands sorted to top) */}
              <div
                ref={commandsContainerRef}
                id="bot-commands-grid-container"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
              >
                {commandsList
                  .filter((c) => {
                    const matchesSearch =
                      c.name.toLowerCase().includes(commandSearch.toLowerCase()) ||
                      (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(commandSearch.toLowerCase())));
                    const matchesFolder = selectedFolder === 'All' || (c.folder || 'All') === selectedFolder;
                    return matchesSearch && matchesFolder;
                  })
                  .sort((a, b) => {
                    // Pinned commands stay at the top
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    return 0;
                  })
                  .map((cmd) => {
                    const isSelected = selectedCommandIds.includes(cmd.id);
                    const isHighlighted = highlightedCommandId === cmd.id;
                    return (
                      <motion.div
                        key={cmd.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => {
                          savedScrollPos.current = window.scrollY;
                          setActiveCommand(cmd);
                          setRenameInput(cmd.name);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group shadow-xs ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500'
                            : isHighlighted
                            ? 'bg-blue-500/15 dark:bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/40 animate-pulse'
                            : cmd.isPinned
                            ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-300 dark:border-amber-700/60'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/70 hover:border-blue-500 dark:hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Touch-friendly checkbox */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCommandIds((prev) =>
                                prev.includes(cmd.id)
                                  ? prev.filter((id) => id !== cmd.id)
                                  : [...prev, cmd.id]
                              );
                            }}
                            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 cursor-pointer border ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                              cmd.isPinned
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                            }`}
                          >
                            <Terminal className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate block">
                                {cmd.name}
                              </span>
                              {(cmd.name === '/Admin_Setups' || cmd.name === '/admin') && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-0.5 shrink-0">
                                  <Shield className="w-2.5 h-2.5" />
                                  <span>Admin</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium truncate block">
                              {cmd.folder === 'General' ? 'All' : (cmd.folder || 'All')} • {cmd.aliases?.length || 0} aliases
                            </span>
                          </div>
                        </div>

                        {/* Action Icons (Pin, Edit, Delete) - Admin Only completely removed */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Pin Toggle Button: Click toggles pin & immediately sorts to top */}
                          <button
                            type="button"
                            title={cmd.isPinned ? 'Unpin command' : 'Pin command to top'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCommandPin(cmd, e);
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              cmd.isPinned
                                ? 'text-amber-500 bg-amber-100 dark:bg-amber-950/50 hover:bg-amber-200'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <Pin
                              className={`w-3.5 h-3.5 ${
                                cmd.isPinned ? 'fill-amber-500 text-amber-500' : ''
                              }`}
                            />
                          </button>

                          {/* Edit Command Icon (Opens Edit Command Modal) */}
                          <button
                            type="button"
                            title="Edit Command"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditCommandModal(cmd, e);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Icon with confirmation dialog */}
                          <button
                            type="button"
                            title="Delete Command"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCommand(cmd);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
        </div>
      )}

      {/* TAB CONTENT 3: SEARCH ACROSS ALL COMMAND CODE */}
      {activeTab === 'Search' && (
        <div className="glass-panel p-6 rounded-3xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Search across all command code…
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Searches {commandsList.length} commands with code. Start typing below to find any string, variable name, or pattern.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={globalCodeSearch}
                  onChange={(e) => setGlobalCodeSearch(e.target.value)}
                  placeholder="Search across all command code…"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                />
              </div>

              {/* Toggles: Aa, |ab|, .*, History */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMatchCase(!matchCase)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    matchCase
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                  title="Match Case"
                >
                  Aa
                </button>
                <button
                  onClick={() => setMatchWholeWord(!matchWholeWord)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    matchWholeWord
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                  title="Match Whole Word"
                >
                  |ab|
                </button>
                <button
                  onClick={() => setUseRegex(!useRegex)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    useRegex
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                  title="Use Regular Expression"
                >
                  .*
                </button>
              </div>
            </div>

            {/* Replace with… row */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={replaceSearchText}
                onChange={(e) => setReplaceSearchText(e.target.value)}
                placeholder="Replace with… (leave empty to delete matches)"
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
              />
              <button
                onClick={handlePrepareReplaceAll}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 shrink-0"
              >
                <span>Replace All...</span>
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {globalCodeSearch.trim()
                  ? `Found matches in ${searchResults.length} command(s)`
                  : 'Enter query to search across all commands'}
              </span>
              {searchResults.length > 0 && (
                <button
                  type="button"
                  onClick={handlePrepareReplaceAll}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Review &amp; Replace All ›
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {searchResults.map((cmd) => (
                <div
                  key={cmd.id}
                  onClick={() => {
                    setActiveTab('Commands');
                    setActiveCommand(cmd);
                  }}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-all space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {cmd.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({cmd.folder || 'All'})
                      </span>
                    </div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                      Open in Editor ›
                    </span>
                  </div>

                  {renderHighlightedSnippet(cmd.code, globalCodeSearch, matchCase)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* TAB CONTENT 5: ERRORS */}
      {activeTab === 'Errors' && (
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Errors</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Runtime exception traces, rate limits, and command failure telemetry.
              </p>
            </div>
            <button
              onClick={() => {
                onUpdateBot({ ...bot, errors: [] });
                showToast('Cleared all error logs');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No errors found — your bot is running smoothly.
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              All 59 command handlers and webhook routes responded with HTTP 200 OK.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: MANAGE (.env, Version, Export Users, Export Bot, Import Commands) */}
      {activeTab === 'Manage' && (
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          {/* Section 1: Update Version */}
          <div className="pb-5 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Update Version — current: {bot.version || '1.0.0'}
            </h3>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={versionInput}
                onChange={(e) => setVersionInput(e.target.value)}
                placeholder="e.g. 1.0.0"
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
              <button
                onClick={() => {
                  onUpdateBot({ ...bot, version: versionInput });
                  showToast(`Updated version to ${versionInput}`);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                Update
              </button>
            </div>
          </div>

          {/* Section 2: Environment Variables */}
          <div className="pb-5 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Environment Variables
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                  Injected as globals into every command (e.g. APP_URL, ADMIN_IDS). Values are strings unless you mark a row raw (for numbers, lists, {'{...}'}).
                </p>
              </div>
              <button
                onClick={() => {
                  const rawFormatted = envVars.map((e) => `${e.key}=${e.value}`).join('\n');
                  setRawEnvText(rawFormatted);
                  setRawEnvModal(true);
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit raw ›
              </button>
            </div>

            {/* Env Table */}
            {envVars.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No variables yet. Add one below.</p>
            ) : (
              <div className="space-y-2">
                {envVars.map((env, idx) => (
                  <div key={env.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={env.key}
                      placeholder="KEY"
                      onChange={(e) => {
                        const updated = [...envVars];
                        updated[idx].key = e.target.value;
                        setEnvVars(updated);
                      }}
                      className="w-1/3 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                    <input
                      type="text"
                      value={env.value}
                      placeholder="VALUE"
                      onChange={(e) => {
                        const updated = [...envVars];
                        updated[idx].value = e.target.value;
                        setEnvVars(updated);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                    <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 shrink-0">
                      <input
                        type="checkbox"
                        checked={env.raw || false}
                        onChange={(e) => {
                          const updated = [...envVars];
                          updated[idx].raw = e.target.checked;
                          setEnvVars(updated);
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>raw</span>
                    </label>
                    <button
                      onClick={() => {
                        setEnvVars(envVars.filter((_, i) => i !== idx));
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setEnvVars([...envVars, { id: `env-${Date.now()}`, key: '', value: '', raw: false }]);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200"
              >
                + Add variable
              </button>
              <button
                onClick={() => {
                  onUpdateBot({ ...bot, envVars });
                  showToast('Saved environment variables');
                }}
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                Save .env
              </button>
            </div>
          </div>

          {/* Section 3: Export Users */}
          <div className="pb-5 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Export Users</h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                {(['json', 'csv'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportUserFormat(fmt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors ${
                      exportUserFormat === fmt
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <label className="flex items-center gap-1">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span>Last Active Date</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span>Creation Date</span>
                </label>
              </div>

              <button
                onClick={handleExportUsers}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Section 4: Export Bot */}
          <div className="pb-5 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Export Bot</h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                {(['json', 'yaml', 'txt'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportBotFormat(fmt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors ${
                      exportBotFormat === fmt
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="botExportMode"
                    checked={!exportIncludeData}
                    onChange={() => setExportIncludeData(false)}
                    className="text-blue-600"
                  />
                  <span>Commands Only</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="botExportMode"
                    checked={exportIncludeData}
                    onChange={() => setExportIncludeData(true)}
                    className="text-blue-600"
                  />
                  <span>Include Bot Data</span>
                </label>
              </div>

              <button
                onClick={handleExportBot}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Section 5: Import Commands */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Import Commands</h3>
            <p className="text-xs text-slate-500">
              Upload or paste an exported bot file (JSON / YAML / TXT). Existing commands are updated, new ones added — ideal for editing your bot with AI, then re-uploading.
            </p>

            <div className="flex items-center gap-2">
              {(['json', 'yaml', 'txt'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setImportFormat(fmt)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-colors ${
                    importFormat === fmt
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {fmt}
                </button>
              ))}

              <label className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-200">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setImportPasteText(event.target?.result as string || '');
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>

            <textarea
              value={importPasteText}
              onChange={(e) => setImportPasteText(e.target.value)}
              placeholder="…or paste your exported commands here"
              rows={4}
              className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={importReplaceExisting}
                  onChange={(e) => setImportReplaceExisting(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>Replace all existing commands</span>
              </label>

              <button
                onClick={handleImportCommands}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* TAB CONTENT: CHATS (Telegram Users & Block/Unblock) */}
      {activeTab === 'Chats' && (
        <BotChatsView
          bot={bot}
          onUpdateBot={onUpdateBot}
          onShowToast={showToast}
        />
      )}

      {/* TAB CONTENT: DATABASE (PostgreSQL Properties & User Records) */}
      {activeTab === 'Database' && (
        <BotDatabaseView
          bot={bot}
          showToast={showToast}
        />
      )}

      {/* TAB CONTENT 8: SETTINGS */}
      {activeTab === 'Settings' && (
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bot Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cluster network properties, translation pipelines, and ownership controls.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500 block">Bot ID</span>
              <div className="flex items-center justify-between mt-1 gap-2">
                <span className="text-lg font-mono font-bold text-slate-900 dark:text-white truncate">
                  {bot.botNumericId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(bot.botNumericId, 'Bot ID')}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer shrink-0"
                  title="Copy Bot ID"
                >
                  {copiedText === 'Bot ID' ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500 block">Bot Token</span>
              <div className="flex items-center justify-between mt-1 gap-2">
                <span className="text-sm font-mono text-slate-900 dark:text-white truncate">
                  {showToken ? bot.token || 'N/A' : '••••••••••••••••••••'}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                    title={showToken ? 'Hide token' : 'Show token'}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(bot.token || '', 'Bot Token')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                    title="Copy Bot Token"
                  >
                    {copiedText === 'Bot Token' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            {/* Faster Response (MTProto) */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Faster Response (MTProto)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  Route this bot through our accelerated network for lower latency. Switching briefly reconnects the bot.
                </p>
              </div>
              <button
                onClick={() => {
                  onUpdateBot({ ...bot, fasterResponse: !bot.fasterResponse });
                  showToast(bot.fasterResponse ? 'Disabled MTProto' : 'Enabled MTProto acceleration');
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                  bot.fasterResponse ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    bot.fasterResponse ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto-Translate (92 languages) */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Auto-Translate (92 languages)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  Messages are safely translated and delivered in each user's own language. Users can pick their language via libs.translate.setLang.
                </p>
              </div>
              <button
                onClick={() => {
                  onUpdateBot({ ...bot, autoTranslate: !bot.autoTranslate });
                  showToast(bot.autoTranslate ? 'Disabled Auto-Translate' : 'Enabled Auto-Translate');
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                  bot.autoTranslate ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    bot.autoTranslate ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Update Token Form */}
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Update Token</h4>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="New token"
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
              <button
                onClick={() => {
                  if (!tokenInput.trim()) return;
                  onUpdateBot({ ...bot, token: tokenInput.trim() });
                  setTokenInput('');
                  showToast('Bot token updated');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                Update
              </button>
            </div>
          </div>

          {/* Transfer Bot Form */}
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Transfer Bot</h4>
            <div className="flex gap-2 max-w-md">
              <input
                type="email"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                placeholder="Recipient email"
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                onClick={handleTransferBotPrompt}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
              >
                Transfer
              </button>
            </div>
          </div>

          {/* Clone Bot */}
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Clone Bot</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Duplicate this bot with all commands and settings.
              </p>
            </div>
            <button
              onClick={handleCloneBotPrompt}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Clone
            </button>
          </div>

          {/* Danger Zone: Permanently Delete */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">Danger Zone</h4>
              <p className="text-xs text-rose-600/90 dark:text-rose-300/80 mt-0.5">
                Permanently delete this bot. Cannot be undone.
              </p>
            </div>
            <button
              onClick={handleDeleteBotPrompt}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-colors cursor-pointer"
            >
              Delete Bot
            </button>
          </div>
        </div>
      )}

      {/* Add New Command Modal */}
      <AnimatePresence>
        {showNewCommandModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-300 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add New Command
                </h3>
                <button
                  onClick={() => setShowNewCommandModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Create a new command for your bot. Enter the command name below (e.g., /start).
              </p>

              <form onSubmit={handleCreateCommand} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Command Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCommandName}
                    onChange={(e) => setNewCommandName(e.target.value)}
                    placeholder="Command names like /start, /help, /settings etc."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowNewCommandModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateCommand(undefined, true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Create &amp; Edit Code
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer transition-colors"
                  >
                    Create Command
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Command Modal */}
      <AnimatePresence>
        {editingCommand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-300 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Edit Command
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {editingCommand.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCommand(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditCommand} className="space-y-3.5">
                {/* Command Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Command Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editCmdName}
                    onChange={(e) => setEditCmdName(e.target.value)}
                    placeholder="/command"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                {/* Unified Single-Box Folder Selector */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Folder
                  </label>

                  {/* The Single Selection Box */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsFolderDropdownOpen(!isFolderDropdownOpen);
                      setIsCreatingNewFolderInModal(false);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {editCmdFolder === 'General' ? 'All' : (editCmdFolder || 'All')}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isFolderDropdownOpen ? 'rotate-180 text-amber-500' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu showing all folders */}
                  {isFolderDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Select a folder
                      </div>

                      {/* 'All' default folder and custom folders */}
                      {['All', ...botFolders.filter((f) => f !== 'General' && f !== 'All')].map((folderItem) => {
                        const isSelected =
                          (editCmdFolder === 'General' ? 'All' : (editCmdFolder || 'All')).toLowerCase() ===
                          folderItem.toLowerCase();
                        return (
                          <button
                            key={folderItem}
                            type="button"
                            onClick={() => {
                              setEditCmdFolder(folderItem);
                              setIsFolderDropdownOpen(false);
                              setIsCreatingNewFolderInModal(false);
                            }}
                            className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                              <span>{folderItem}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-amber-500" />}
                          </button>
                        );
                      })}

                      {/* Add new folder inside dropdown */}
                      <div className="border-t border-slate-200 dark:border-slate-700/80 mt-1 pt-1 px-2 pb-1">
                        {isCreatingNewFolderInModal ? (
                          <div className="flex items-center gap-1.5 p-1">
                            <input
                              type="text"
                              autoFocus
                              value={modalNewFolderInput}
                              onChange={(e) => setModalNewFolderInput(e.target.value)}
                              placeholder="New folder name..."
                              className="flex-1 px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const trimmed = modalNewFolderInput.trim();
                                  if (trimmed) {
                                    if (!botFolders.includes(trimmed)) {
                                      setBotFolders((prev) => [...prev, trimmed]);
                                    }
                                    setEditCmdFolder(trimmed);
                                    setModalNewFolderInput('');
                                    setIsCreatingNewFolderInModal(false);
                                    setIsFolderDropdownOpen(false);
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const trimmed = modalNewFolderInput.trim();
                                if (trimmed) {
                                  if (!botFolders.includes(trimmed)) {
                                    setBotFolders((prev) => [...prev, trimmed]);
                                  }
                                  setEditCmdFolder(trimmed);
                                  setModalNewFolderInput('');
                                  setIsCreatingNewFolderInModal(false);
                                  setIsFolderDropdownOpen(false);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsCreatingNewFolderInModal(true)}
                            className="w-full px-2.5 py-1.5 text-xs text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Create New Folder</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pin to Top Checkbox / Switch */}
                <div
                  onClick={() => setEditCmdPinned(!editCmdPinned)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    editCmdPinned
                      ? 'bg-amber-500/10 border-amber-500/40 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        editCmdPinned
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Pin Command</span>
                      <span className="text-[10px] text-slate-400 block">
                        Keep at top of bot commands
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                      editCmdPinned ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        editCmdPinned ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Aliases */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Aliases ({editCmdAliases.length}/10)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newEditAliasInput}
                      onChange={(e) => setNewEditAliasInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddEditAlias();
                        }
                      }}
                      placeholder="e.g. /menu, /help"
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddEditAlias}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {editCmdAliases.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {editCmdAliases.map((alias) => (
                        <span
                          key={alias}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[11px] font-mono"
                        >
                          {alias}
                          <button
                            type="button"
                            onClick={() => handleRemoveEditAlias(alias)}
                            className="text-blue-400 hover:text-rose-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      const cmd = editingCommand;
                      setEditingCommand(null);
                      savedScrollPos.current = window.scrollY;
                      setActiveCommand(cmd);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Open Code Editor</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCommand(null)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename Command Modal */}
      <AnimatePresence>
        {showRenameModal && activeCommand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-300 dark:border-slate-800 space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rename Command</h3>
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowRenameModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRenameCommand(activeCommand)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-300 dark:border-slate-800 space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create a folder</h3>
              <input
                type="text"
                value={newFolderInput}
                onChange={(e) => setNewFolderInput(e.target.value)}
                placeholder="Folder name"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newFolderInput.trim() && activeCommand) {
                      const updated = commandsList.map((c) =>
                        c.id === activeCommand.id ? { ...c, folder: newFolderInput.trim() } : c
                      );
                      onUpdateBot({ ...bot, commands: updated });
                      setActiveCommand({ ...activeCommand, folder: newFolderInput.trim() });
                    }
                    setShowNewFolderModal(false);
                    setNewFolderInput('');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deleted Commands (Recycle Bin) Modal */}
      <AnimatePresence>
        {showDeletedCommandsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-300 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Deleted Commands ({deletedCommands.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Deleted commands can be recovered anytime or permanently cleared.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeletedCommandsModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {deletedCommands.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No deleted commands
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Commands you delete will appear here in the recycle bin.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {deletedCommands.map((cmd) => (
                    <div
                      key={cmd.id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {cmd.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {cmd.folder === 'General' ? 'All' : (cmd.folder || 'All')} • {cmd.aliases?.length || 0} aliases
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRestoreCommand(cmd)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => handlePermanentlyDeleteCommand(cmd.id)}
                          className="px-2.5 py-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold transition-colors cursor-pointer"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowDeletedCommandsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Folders Modal */}
      <AnimatePresence>
        {showManageFoldersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-300 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                    <Folder className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Manage Folders
                  </h3>
                </div>
                <button
                  onClick={() => setShowManageFoldersModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Create new folder input */}
              <form onSubmit={handleCreateFolder} className="flex gap-2">
                <input
                  type="text"
                  value={newFolderNameInput}
                  onChange={(e) => setNewFolderNameInput(e.target.value)}
                  placeholder="New folder name (e.g. Hi, Payments)"
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer transition-colors"
                >
                  Create
                </button>
              </form>

              {/* Existing folders list */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Existing Folders
                </span>
                {botFolders
                  .filter((f) => f !== 'General')
                  .map((folderName) => {
                    const count = commandsList.filter((c) => (c.folder || 'All') === folderName).length;
                    return (
                      <div
                        key={folderName}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {folderName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({count} commands)
                          </span>
                        </div>
                        {folderName !== 'All' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFolder(folderName)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title={`Delete ${folderName} folder`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowManageFoldersModal(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Advanced Delete Command(s) Modal */}
      <DeleteCommandModal
        isOpen={showDeleteModal}
        commands={commandsPendingDelete}
        onClose={() => {
          setShowDeleteModal(false);
          setCommandsPendingDelete([]);
        }}
        onConfirmMoveToTrash={handleConfirmMoveToTrash}
        onConfirmPermanentDelete={handleConfirmPermanentDelete}
      />

      {/* Code Diff Confirmation for Replace All */}
      <ReplaceAllDiffModal
        isOpen={showReplaceAllDiffModal}
        previews={diffPreviews}
        searchQuery={globalCodeSearch}
        replaceText={replaceSearchText}
        onClose={() => setShowReplaceAllDiffModal(false)}
        onConfirmReplaceAll={handleApplyReplaceAll}
      />
    </div>
  );
};
