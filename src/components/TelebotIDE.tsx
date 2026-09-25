import React, { useState, useEffect, useRef, useCallback } from 'react';
import ace from 'ace-builds';

// Ace modes, themes, and extensions
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';

// Suppress Ace basePath inference warning from console.error
if (typeof console !== 'undefined' && console.error) {
  const origConsoleError = console.error;
  console.error = function (...args: any[]) {
    if (
      args.length > 0 &&
      typeof args[0] === 'string' &&
      args[0].indexOf('Unable to infer path to ace') !== -1
    ) {
      return;
    }
    return origConsoleError.apply(console, args);
  };
}

// Configure Ace base paths to resolve basePath inference warning
ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.32.7/src-min-noconflict/');
ace.config.set('modePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.32.7/src-min-noconflict/');
ace.config.set('themePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.32.7/src-min-noconflict/');
(ace.config as any).set('workerPath', '');
(ace.config as any).set('useWorker', false);

// Prevent Ace from ever attempting to spawn Web Workers in browser sandbox
try {
  (ace.EditSession.prototype as any).$startWorker = function () {
    this.$worker = null;
  };
} catch (_) {}

// Guard EditSession getLine / getLines / getLength against null or destroyed doc access
try {
  const origGetLine = ace.EditSession.prototype.getLine;
  ace.EditSession.prototype.getLine = function (row: number) {
    if (!this.doc || typeof this.doc.getLine !== 'function') return '';
    try {
      return origGetLine ? origGetLine.call(this, row) : (this.doc.getLine(row) || '');
    } catch (_) {
      return '';
    }
  };

  const origGetLines = ace.EditSession.prototype.getLines;
  ace.EditSession.prototype.getLines = function (firstRow: number, lastRow: number) {
    if (!this.doc || typeof this.doc.getLines !== 'function') return [];
    try {
      return origGetLines ? origGetLines.call(this, firstRow, lastRow) : (this.doc.getLines(firstRow, lastRow) || []);
    } catch (_) {
      return [];
    }
  };

  const origGetLength = ace.EditSession.prototype.getLength;
  ace.EditSession.prototype.getLength = function () {
    if (!this.doc || typeof this.doc.getLength !== 'function') return 0;
    try {
      return origGetLength ? origGetLength.call(this) : (this.doc.getLength() || 0);
    } catch (_) {
      return 0;
    }
  };
} catch (_) {}

// Guard BackgroundTokenizer against null doc access during tokenization or deferred timer runs
try {
  const bgTokenizerModule = (ace as any).require?.('ace/background_tokenizer');
  let bgTokenizerProto = bgTokenizerModule?.BackgroundTokenizer?.prototype;

  if (!bgTokenizerProto) {
    try {
      const dummy = new ace.EditSession('');
      if ((dummy as any).bgTokenizer) {
        bgTokenizerProto = Object.getPrototypeOf((dummy as any).bgTokenizer);
      }
    } catch (_) {}
  }

  if (bgTokenizerProto && bgTokenizerProto.$tokenizeRow) {
    const origTokenizeRow = bgTokenizerProto.$tokenizeRow;
    bgTokenizerProto.$tokenizeRow = function (row: number) {
      if (!this.doc || typeof this.doc.getLine !== 'function') {
        if (!this.lines) this.lines = [];
        return (this.lines[row] = []);
      }
      try {
        return origTokenizeRow.call(this, row);
      } catch (_) {
        if (!this.lines) this.lines = [];
        return (this.lines[row] = []);
      }
    };

    const origStart = bgTokenizerProto.start;
    if (origStart) {
      bgTokenizerProto.start = function (startRow: number) {
        if (!this.doc || typeof this.doc.getLength !== 'function') {
          this.running = false;
          return;
        }
        try {
          return origStart.call(this, startRow);
        } catch (_) {
          this.running = false;
        }
      };
    }
  }
} catch (_) {}

import {
  ArrowLeft,
  Save,
  Check,
  RotateCcw,
  RotateCw,
  Search,
  X,
  Copy,
  Download,
  Upload,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Code2,
  FileCode,
  FileText,
  Clipboard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  WrapText,
  Type,
  Sun,
  Moon,
  Plus,
  Minus,
  FolderPlus,
} from 'lucide-react';
import { BotCommand } from '../types';
import { beautifyPythonCode } from '../utils/codeFormatter';
import { TELEBOT_COMPLETIONS } from '../utils/telebotCompleters';
import { validatePythonSyntax, SyntaxCheckResult } from '../utils/pythonSyntaxChecker';
import { SyntaxCheckPanel } from './SyntaxCheckPanel';
import { PasteCodeModal } from './PasteCodeModal';

interface OpenTabItem {
  id: string;
  name: string;
  code: string;
  commandRef?: BotCommand;
  isModified?: boolean;
}

interface TelebotIDEProps {
  initialCommand?: BotCommand | null;
  command?: BotCommand | null;
  allCommands?: BotCommand[];
  botName?: string;
  botUsername?: string;
  bot?: { name?: string; username?: string; commands?: BotCommand[] };
  onBack?: () => void;
  onClose?: () => void;
  onSaveCommand?: (
    commandOrId: BotCommand | string,
    updatedCode?: string,
    metadata?: Partial<BotCommand>
  ) => void;
  onSelectOtherCommand?: (command: BotCommand) => void;
  onRunSimulation?: (cmd: BotCommand) => void;
  onCreateCommand?: (command: BotCommand) => void;
}

// File badge helper: strictly Python for Telebot commands
const getFileBadge = (_name: string, _code?: string): string => {
  return 'PY';
};

// Ace Mode detector: strictly Python
const getAceMode = (_name: string, _code?: string): string => {
  return 'python';
};

export const TelebotIDE: React.FC<TelebotIDEProps> = ({
  initialCommand,
  command,
  allCommands = [],
  botName,
  bot,
  onBack,
  onClose,
  onSaveCommand,
  onCreateCommand,
}) => {
  // Helper to reliably resolve full code for any command from props or allCommands
  const getCommandCode = useCallback(
    (cmd?: Partial<BotCommand> | null): string => {
      if (!cmd) return '';
      if (typeof cmd.code === 'string' && cmd.code.trim().length > 0) {
        return cmd.code;
      }
      const matched = allCommands.find((c) => c.id === cmd.id || c.name === cmd.name);
      if (matched && typeof matched.code === 'string' && matched.code.trim().length > 0) {
        return matched.code;
      }
      return `# Command: ${cmd.name || '/start'}
# Telebot Creator Engine (Python / TPY)
import telebot
from telebot import types

user_id = message.from_user.id
chat_id = message.chat.id

# Process and reply
bot.send_message(
    chat_id,
    f"🤖 Executing command: *${cmd.name || '/start'}*\\nUser ID: {user_id}",
    parse_mode="Markdown"
)
`;
    },
    [allCommands]
  );

  const resolvedCmd = initialCommand || command || allCommands[0] || {
    id: 'cmd-start',
    name: '/start',
    code: `# Telebot Python Script\n# Powered by VS Code-grade Editor Engine\n\nuser_id = Bot.getChatId()\nmessage_text = Bot.getMessageText()\n\nif user_id > 0:\n    Bot.sendMessage(user_id, "Hello! Welcome to Telebot Creator.")\n    \n    # Send interactive buttons\n    keyboard = [\n        [{"text": "💰 Balance", "callback_data": "/balance"}],\n        [{"text": "⚙️ Settings", "callback_data": "/settings"}]\n    ]\n    Bot.sendInlineKeyboard(user_id, "Choose an action below:", keyboard)\n`,
  };

  const resolvedBotName = botName || bot?.name || 'Bot';
  const initialResolvedCode = getCommandCode(resolvedCmd);

  // Track the saved baseline code for each tab so undo back to original disables the Save button
  const savedCodeMapRef = useRef<Map<string, string>>(new Map([[resolvedCmd.id, initialResolvedCode]]));

  // Open tabs state
  const [openTabs, setOpenTabs] = useState<OpenTabItem[]>([
    {
      id: resolvedCmd.id,
      name: resolvedCmd.name,
      code: initialResolvedCode,
      commandRef: { ...resolvedCmd, code: initialResolvedCode },
      isModified: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(resolvedCmd.id);
  const activeTabIdRef = useRef<string>(resolvedCmd.id);

  // Per-Tab Isolated Ace EditSessions to guarantee 100% separate documents, undo/redo stacks, and cursor state
  const sessionsRef = useRef<Map<string, ace.Ace.EditSession>>(new Map());
  const prevActiveTabIdRef = useRef<string>(resolvedCmd.id);
  const openTabsRef = useRef(openTabs);
  useEffect(() => {
    openTabsRef.current = openTabs;
  }, [openTabs]);

  // Can undo / can redo / can save states
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [canSave, setCanSave] = useState<boolean>(false);

  // Syntax Checker modal & state
  const [showSyntaxChecker, setShowSyntaxChecker] = useState<boolean>(false);
  const [syntaxResult, setSyntaxResult] = useState<SyntaxCheckResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });

  // Direct Paste Code modal
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);

  // Plus (+) new tab dropdown
  const [showNewTabSelector, setShowNewTabSelector] = useState(false);
  const [newTabSearch, setNewTabSearch] = useState('');
  const newTabSearchInputRef = useRef<HTMLInputElement | null>(null);
  const newTabDropdownRef = useRef<HTMLDivElement | null>(null);

  // Mobile overflow "More Tools" menu
  const [showMobileMore, setShowMobileMore] = useState(false);
  const mobileMoreRef = useRef<HTMLDivElement | null>(null);

  // Hidden File input ref for importing .txt files
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Editor states
  const DEFAULT_FONT_SIZE = 13;
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [ideTheme, setIdeTheme] = useState<'dark' | 'light'>('dark');
  const [isWordWrap, setIsWordWrap] = useState<boolean>(true);
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const [editorLineCount, setEditorLineCount] = useState<number>(1);

  // New Command Creation states inside the (+) selector
  const [newCmdNameInput, setNewCmdNameInput] = useState('');
  const [newCmdFolderInput, setNewCmdFolderInput] = useState('All');

  // Font size adjust logic: 1-10 step 2 (2, 4, 6, 8, 10), then 11-30 step 1
  const handleIncreaseFontSize = () => {
    setFontSize((prev) => {
      if (prev >= 30) return 30;
      if (prev < 10) return Math.min(10, prev + 2);
      return Math.min(30, prev + 1);
    });
  };

  const handleDecreaseFontSize = () => {
    setFontSize((prev) => {
      if (prev <= 2) return 2;
      if (prev <= 10) return Math.max(2, prev - 2);
      return Math.max(2, prev - 1);
    });
  };

  // Find & Replace state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matchCount, setMatchCount] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Notifications / feedback
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 2400);
  };

  // Ace Editor instance ref & container ref
  const aceEditorRef = useRef<ace.Ace.Editor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const tabsScrollContainerRef = useRef<HTMLDivElement | null>(null);

  const activeTab = openTabs.find((t) => t.id === activeTabId) || openTabs[0];
  const activeMode = getAceMode(activeTab?.name || '', activeTab?.code || '');

  // Keep ref in sync
  useEffect(() => {
    activeTabIdRef.current = activeTabId;
    // Auto-scroll active tab into view for smooth PC/mobile navigation
    if (tabsScrollContainerRef.current) {
      const activeEl = tabsScrollContainerRef.current.querySelector(
        `[data-tab-id="${activeTabId}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      }
    }
  }, [activeTabId]);

  // Lock body scroll on mount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Register Custom Telebot Completer once on mount
  useEffect(() => {
    try {
      const langTools = ace.require('ace/ext/language_tools');
      if (langTools && typeof langTools.addCompleter === 'function') {
        const telebotCompleter = {
          getCompletions: (
            _editor: ace.Ace.Editor,
            _session: ace.Ace.EditSession,
            _pos: ace.Ace.Point,
            prefix: string,
            callback: (error: null, results: unknown[]) => void
          ) => {
            if (!prefix && !prefix.length) {
              callback(null, []);
              return;
            }
            callback(null, TELEBOT_COMPLETIONS);
          },
        };
        langTools.addCompleter(telebotCompleter);
      }
    } catch {
      // Ignore if already loaded or headless
    }
  }, []);

  // Helper to get or create an isolated EditSession for a tab
  const getOrCreateSession = useCallback(
    (tab: OpenTabItem, initialWrap = isWordWrap): ace.Ace.EditSession => {
      let session = sessionsRef.current.get(tab.id);
      const originalCode = savedCodeMapRef.current.get(tab.id) ?? tab.code ?? '';

      if (!session) {
        const mode = getAceMode(tab.name);
        const safeCode = typeof tab.code === 'string' && tab.code.length > 0 ? tab.code : originalCode;
        if (!savedCodeMapRef.current.has(tab.id)) {
          savedCodeMapRef.current.set(tab.id, safeCode);
        }

        session = new ace.EditSession(safeCode);
        session.setUseWorker(false);
        session.setMode(`ace/mode/${mode}`);
        session.setUndoManager(new ace.UndoManager());
        session.setTabSize(4);
        session.setUseSoftTabs(true);
        session.setUseWrapMode(initialWrap);

        // Listen for changes strictly within this session
        session.on('change', () => {
          if (!session) return;
          const currentVal = session.getValue();
          const baseSaved = savedCodeMapRef.current.get(tab.id) ?? '';
          const isDirty = currentVal !== baseSaved;
          const um = session.getUndoManager();

          setCanUndo(um.hasUndo());
          setCanRedo(um.hasRedo());
          setCanSave(isDirty);
          setEditorLineCount(session.getLength());

          setOpenTabs((prev) =>
            prev.map((t) => (t.id === tab.id ? { ...t, code: currentVal, isModified: isDirty } : t))
          );
        });

        sessionsRef.current.set(tab.id, session);
      } else {
        // If session exists but was empty and tab now has code, update it
        if ((!session.getValue() || session.getValue().trim().length === 0) && tab.code) {
          session.setValue(tab.code);
          if (!savedCodeMapRef.current.has(tab.id)) {
            savedCodeMapRef.current.set(tab.id, tab.code);
          }
        }
      }
      return session;
    },
    [isWordWrap]
  );

  // Mount native Ace Editor instance once and attach current tab session
  useEffect(() => {
    if (!editorContainerRef.current) return;

    const editor = ace.edit(editorContainerRef.current);
    editor.setTheme('ace/theme/tomorrow_night');
    editor.setFontSize(fontSize);
    editor.setShowPrintMargin(false);
    editor.renderer.setShowGutter(true);
    editor.setHighlightActiveLine(true);
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      enableSnippets: true,
      showLineNumbers: true,
      useWorker: false,
      behavioursEnabled: true,
      wrapBehavioursEnabled: true,
      autoScrollEditorIntoView: true,
    });

    aceEditorRef.current = editor;

    // Attach active tab's session
    const currentTab =
      openTabsRef.current.find((t) => t.id === activeTabIdRef.current) || openTabsRef.current[0];
    if (currentTab) {
      const session = getOrCreateSession(currentTab, isWordWrap);
      editor.setSession(session);
      const um = session.getUndoManager();
      setCanUndo(um.hasUndo());
      setCanRedo(um.hasRedo());
      setCanSave(Boolean(currentTab.isModified));
      setEditorLineCount(session.getLength());
    }

    editor.on('changeSelection', () => {
      const pos = editor.getCursorPosition();
      setCursorPos({ line: pos.row + 1, col: pos.column + 1 });
    });

    editor.resize(true);

    const ro = new ResizeObserver(() => {
      editor.resize();
    });
    ro.observe(editorContainerRef.current);

    return () => {
      ro.disconnect();
      try {
        sessionsRef.current.forEach((sess) => {
          try {
            (sess as any)?.bgTokenizer?.stop?.();
          } catch (_) {}
        });
        editor.destroy();
      } catch (_) {}
      aceEditorRef.current = null;
    };
  }, []);

  // Sync font size with Ace
  useEffect(() => {
    if (aceEditorRef.current) {
      aceEditorRef.current.setFontSize(fontSize);
    }
  }, [fontSize]);

  // Sync theme with Ace
  useEffect(() => {
    if (aceEditorRef.current) {
      aceEditorRef.current.setTheme(
        ideTheme === 'dark' ? 'ace/theme/tomorrow_night' : 'ace/theme/chrome'
      );
    }
  }, [ideTheme]);

  // Switch session cleanly when active tab changes, isolating undo/redo stacks
  useEffect(() => {
    if (!aceEditorRef.current) return;
    const editor = aceEditorRef.current;
    const targetTab = openTabsRef.current.find((t) => t.id === activeTabId) || openTabsRef.current[0];
    if (!targetTab) return;

    activeTabIdRef.current = targetTab.id;
    const session = getOrCreateSession(targetTab, isWordWrap);
    editor.setSession(session);
    session.setUseWrapMode(isWordWrap);

    // If session has no code but targetTab has code, ensure it is set
    if ((!session.getValue() || session.getValue().trim().length === 0) && targetTab.code) {
      session.setValue(targetTab.code);
    }

    // Update undo/redo and save flags strictly for this tab based on baseline comparison
    const um = session.getUndoManager();
    const currentVal = session.getValue();
    const baseSaved = savedCodeMapRef.current.get(targetTab.id) ?? targetTab.code ?? '';
    const isDirty = currentVal !== baseSaved;

    setCanUndo(um.hasUndo());
    setCanRedo(um.hasRedo());
    setCanSave(isDirty);
    setEditorLineCount(session.getLength());

    editor.focus();
  }, [activeTabId, getOrCreateSession, isWordWrap]);

  // Sync word wrap setting with Ace session
  useEffect(() => {
    if (aceEditorRef.current) {
      const session = aceEditorRef.current.getSession();
      if (session) {
        session.setUseWrapMode(isWordWrap);
      }
    }
  }, [isWordWrap]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        newTabDropdownRef.current &&
        !newTabDropdownRef.current.contains(e.target as Node)
      ) {
        setShowNewTabSelector(false);
      }
      if (
        mobileMoreRef.current &&
        !mobileMoreRef.current.contains(e.target as Node)
      ) {
        setShowMobileMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync external command updates
  useEffect(() => {
    const cmd = initialCommand || command;
    if (cmd) {
      const codeToLoad = getCommandCode(cmd);
      if (!savedCodeMapRef.current.has(cmd.id)) {
        savedCodeMapRef.current.set(cmd.id, codeToLoad);
      }

      setOpenTabs((prev) => {
        const found = prev.find((t) => t.id === cmd.id);
        if (found) {
          if (!found.code && codeToLoad) {
            return prev.map((t) => (t.id === cmd.id ? { ...t, code: codeToLoad } : t));
          }
          return prev;
        }
        return [
          ...prev,
          {
            id: cmd.id,
            name: cmd.name,
            code: codeToLoad,
            commandRef: cmd,
            isModified: false,
          },
        ];
      });

      // Ensure session is populated
      const session = sessionsRef.current.get(cmd.id);
      if (session && (!session.getValue() || session.getValue().trim().length === 0) && codeToLoad) {
        session.setValue(codeToLoad);
      }

      setActiveTabId(cmd.id);
    }
  }, [initialCommand?.id, command?.id, getCommandCode]);

  // Calculate live search matches
  const calculateMatches = useCallback(
    (query: string, code: string) => {
      if (!query || !code) {
        setMatchCount(0);
        return;
      }
      try {
        let flags = 'g';
        if (!matchCase) flags += 'i';
        let pattern = query;
        if (!useRegex) {
          pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        if (matchWholeWord) {
          pattern = `\\b${pattern}\\b`;
        }
        const regex = new RegExp(pattern, flags);
        const matches = code.match(regex);
        setMatchCount(matches ? matches.length : 0);
      } catch {
        setMatchCount(0);
      }
    },
    [matchCase, matchWholeWord, useRegex]
  );

  useEffect(() => {
    if (showSearch && searchQuery && activeTab?.code) {
      calculateMatches(searchQuery, activeTab.code);
    } else {
      setMatchCount(0);
    }
  }, [showSearch, searchQuery, activeTab?.code, calculateMatches]);

  // Find next/prev using Ace search engine
  const handleFind = useCallback(
    (backwards = false) => {
      if (!aceEditorRef.current || !searchQuery) return;
      aceEditorRef.current.find(searchQuery, {
        backwards,
        wrap: true,
        caseSensitive: matchCase,
        wholeWord: matchWholeWord,
        regExp: useRegex,
      });
      if (activeTab?.code) {
        calculateMatches(searchQuery, activeTab.code);
      }
    },
    [searchQuery, matchCase, matchWholeWord, useRegex, activeTab?.code, calculateMatches]
  );

  // Replace current match
  const handleReplace = () => {
    if (!aceEditorRef.current || !searchQuery) return;
    aceEditorRef.current.replace(replaceQuery);
    handleFind(false);
  };

  // Replace all matches
  const handleReplaceAll = () => {
    if (!aceEditorRef.current || !searchQuery) return;
    aceEditorRef.current.replaceAll(replaceQuery, {
      caseSensitive: matchCase,
      wholeWord: matchWholeWord,
      regExp: useRegex,
    });
    if (activeTab?.code) {
      calculateMatches(searchQuery, activeTab.code);
    }
    showNotification('All occurrences replaced');
  };

  // Format / Beautify Code (Magic Tool)
  const handleFormatCode = useCallback(() => {
    if (!activeTab || !aceEditorRef.current) return;
    const currentCode = aceEditorRef.current.getValue();
    const formatted = beautifyPythonCode(currentCode);

    if (formatted === currentCode) {
      showNotification('Code is already clean & formatted ✨', 'info');
      return;
    }

    // Apply formatted code to session
    const session = aceEditorRef.current.getSession();
    const cursor = aceEditorRef.current.getCursorPosition();
    session.setValue(formatted);
    aceEditorRef.current.moveCursorToPosition(cursor);
    showNotification('Code Beautified & Formatted ✨', 'success');
  }, [activeTab]);

  // Global keyboard shortcuts (Ctrl+S, Ctrl+F, Ctrl+H, Alt+Shift+F, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleFormatCode();
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
        aceEditorRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, activeTab, handleFormatCode]);

  // Open command in tab
  const handleOpenCommandInTab = (cmd: BotCommand) => {
    const existing = openTabs.find((t) => t.id === cmd.id);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newTab: OpenTabItem = {
        id: cmd.id,
        name: cmd.name,
        code: cmd.code || `# ${cmd.name}\nBot.sendMessage(Bot.getChatId(), "Hello from ${cmd.name}")\n`,
        commandRef: cmd,
        isModified: false,
      };
      setOpenTabs((prev) => [...prev, newTab]);
      setActiveTabId(cmd.id);
    }
    setShowNewTabSelector(false);
    setNewTabSearch('');
  };

  // Close tab
  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (openTabs.length === 1) return; // Keep at least one tab
    const nextTabs = openTabs.filter((t) => t.id !== tabId);
    setOpenTabs(nextTabs);
    // Cleanup EditSession for closed tab
    const closingSession = sessionsRef.current.get(tabId);
    if (closingSession) {
      try {
        (closingSession as any)?.bgTokenizer?.stop?.();
      } catch (_) {}
    }
    sessionsRef.current.delete(tabId);
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    }
  };

  // Undo & Redo (Strictly isolated per tab session with accurate baseline dirty tracking)
  const handleUndo = () => {
    if (aceEditorRef.current && canUndo) {
      aceEditorRef.current.undo();
      const session = aceEditorRef.current.getSession();
      const currentVal = session.getValue();
      const baseSaved = savedCodeMapRef.current.get(activeTabId) ?? '';
      const isDirty = currentVal !== baseSaved;
      const um = session.getUndoManager();

      setCanUndo(um.hasUndo());
      setCanRedo(um.hasRedo());
      setCanSave(isDirty);
      setOpenTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, code: currentVal, isModified: isDirty } : t))
      );
      aceEditorRef.current.focus();
    }
  };

  const handleRedo = () => {
    if (aceEditorRef.current && canRedo) {
      aceEditorRef.current.redo();
      const session = aceEditorRef.current.getSession();
      const currentVal = session.getValue();
      const baseSaved = savedCodeMapRef.current.get(activeTabId) ?? '';
      const isDirty = currentVal !== baseSaved;
      const um = session.getUndoManager();

      setCanUndo(um.hasUndo());
      setCanRedo(um.hasRedo());
      setCanSave(isDirty);
      setOpenTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, code: currentVal, isModified: isDirty } : t))
      );
      aceEditorRef.current.focus();
    }
  };

  // Save handler - only saved when modified
  const handleSave = () => {
    if (!activeTab || !aceEditorRef.current) return;
    const currentCode = aceEditorRef.current.getValue();

    // Mark current code as saved baseline
    savedCodeMapRef.current.set(activeTab.id, currentCode);

    if (onSaveCommand) {
      if (onSaveCommand.length >= 2) {
        onSaveCommand(activeTab.id, currentCode, activeTab.commandRef);
      } else {
        onSaveCommand({
          ...activeTab.commandRef,
          id: activeTab.id,
          name: activeTab.name,
          code: currentCode,
        });
      }
    }
    setOpenTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, code: currentCode, isModified: false } : t))
    );
    setCanSave(false);
    showNotification(`Saved ${activeTab.name} successfully`, 'success');
  };

  // Direct Paste Code handler (Paste Code)
  const handlePasteCodeDirect = async () => {
    if (!aceEditorRef.current) return;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          aceEditorRef.current.insert(text);
          aceEditorRef.current.focus();
          showNotification('Code pasted from clipboard 📋', 'success');
          return;
        }
      }
    } catch {
      // Browser denied clipboard access or iframe restrictions apply
    }
    setShowPasteModal(true);
  };

  const handleApplyPaste = (codeToInsert: string, replaceAll: boolean) => {
    if (!aceEditorRef.current) return;
    const session = aceEditorRef.current.getSession();
    if (replaceAll) {
      session.setValue(codeToInsert);
    } else {
      aceEditorRef.current.insert(codeToInsert);
    }
    aceEditorRef.current.focus();
    showNotification('Code pasted into editor 📋', 'success');
  };

  // Syntax Checker handler (Save / Check Syntax)
  const handleCheckSyntax = () => {
    if (!aceEditorRef.current) return;
    const code = aceEditorRef.current.getValue();
    const res = validatePythonSyntax(code);
    setSyntaxResult(res);

    // Apply gutter annotations to Ace
    const session = aceEditorRef.current.getSession();
    const annotations: ace.Ace.Annotation[] = [
      ...res.errors.map((err) => ({
        row: Math.max(0, err.line - 1),
        column: Math.max(0, err.column - 1),
        text: err.message,
        type: 'error' as const,
      })),
      ...res.warnings.map((warn) => ({
        row: Math.max(0, warn.line - 1),
        column: Math.max(0, warn.column - 1),
        text: warn.message,
        type: 'warning' as const,
      })),
    ];
    session.setAnnotations(annotations);

    if (res.isValid && res.warnings.length === 0) {
      showNotification('✓ Syntax is 100% Valid! No errors found.', 'success');
    }
    setShowSyntaxChecker(true);
  };

  const handleJumpToLine = (line: number, column = 1) => {
    if (!aceEditorRef.current) return;
    aceEditorRef.current.gotoLine(line, column, true);
    aceEditorRef.current.focus();
  };

  // Copy Code
  const handleCopyCode = () => {
    if (!aceEditorRef.current) return;
    const code = aceEditorRef.current.getValue();
    navigator.clipboard.writeText(code).then(() => {
      showNotification('Code copied to clipboard', 'info');
      setShowMobileMore(false);
    });
  };

  // Download Script strictly as Plain Text (.txt)
  const handleDownloadScript = () => {
    if (!activeTab || !aceEditorRef.current) return;
    const code = aceEditorRef.current.getValue();
    const cleanName = activeTab.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'telebot_command';
    const filename = `${cleanName}.txt`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`Downloaded ${filename} (Text File)`, 'info');
    setShowMobileMore(false);
  };

  // Upload & Import from .txt file
  const handleUploadTxtFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content === 'string' && aceEditorRef.current) {
        const session = aceEditorRef.current.getSession();
        session.setValue(content);
        showNotification(`Imported "${file.name}" (.txt file)`, 'success');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setShowMobileMore(false);
  };

  // Toggle Comment (#) on active line
  const handleToggleComment = () => {
    if (!aceEditorRef.current) return;
    aceEditorRef.current.toggleCommentLines();
    aceEditorRef.current.focus();
  };

  // Duplicate Current Line Down
  const handleDuplicateLine = () => {
    if (!aceEditorRef.current) return;
    aceEditorRef.current.copyLinesDown();
    aceEditorRef.current.focus();
  };

  // Delete Current Line
  const handleDeleteLine = () => {
    if (!aceEditorRef.current) return;
    aceEditorRef.current.removeLines();
    aceEditorRef.current.focus();
  };

  // Indent (Tab / 4 spaces)
  const handleIndent = () => {
    if (!aceEditorRef.current) return;
    aceEditorRef.current.blockIndent();
    aceEditorRef.current.focus();
  };

  // Outdent (Shift+Tab)
  const handleOutdent = () => {
    if (!aceEditorRef.current) return;
    aceEditorRef.current.blockOutdent();
    aceEditorRef.current.focus();
  };

  // Insert Quick Code Snippet
  const handleInsertCode = (codeStr: string) => {
    if (!aceEditorRef.current) return;
    aceEditorRef.current.insert(codeStr);
    aceEditorRef.current.focus();
  };

  // Insert Quick Character
  const handleInsertChar = (char: string) => {
    if (!aceEditorRef.current) return;
    aceEditorRef.current.insert(char);
    aceEditorRef.current.focus();
  };

  // Back handler
  const handleBack = () => {
    if (onBack) onBack();
    else if (onClose) onClose();
  };

  // Create new command directly from search / plus palette
  const handleCreateAndOpenCommand = (cmdName: string, folder: string = 'All') => {
    const trimmed = cmdName.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const newCmd: BotCommand = {
      id: `cmd-${Date.now()}`,
      name: formatted,
      code: `# Command: ${formatted}\n# Telebot Creator Engine (Python)\n\nuser_id = Bot.getChatId()\ncommand_text = Bot.getMessageText()\n\nif user_id:\n    Bot.sendMessage(user_id, f"Hello from ${formatted}!")\n`,
      folder: folder.trim() || 'All',
    };
    if (onCreateCommand) {
      onCreateCommand(newCmd);
    }
    handleOpenCommandInTab(newCmd);
    setNewTabSearch('');
    setNewCmdNameInput('');
    setShowNewTabSelector(false);
    showNotification(`Created & opened tab for ${formatted}`, 'success');
  };

  // Ensure available commands list is rich & populated
  const defaultCommandsList: BotCommand[] = [
    { id: 'cmd-start', name: '/start', code: `# Welcome command\nuser_id = Bot.getChatId()\nBot.sendMessage(user_id, "Welcome!")\n`, folder: 'Main' },
    { id: 'cmd-help', name: '/help', code: `# Help menu\nuser_id = Bot.getChatId()\nBot.sendMessage(user_id, "Available commands:\\n/start\\n/help\\n/balance")\n`, folder: 'Main' },
    { id: 'cmd-balance', name: '/balance', code: `# Balance\nuser_id = Bot.getChatId()\nBot.sendMessage(user_id, "Balance: $0.00")\n`, folder: 'Finance' },
    { id: 'cmd-deposit', name: '/deposit', code: `# Deposit\nuser_id = Bot.getChatId()\nBot.sendMessage(user_id, "Deposit menu")\n`, folder: 'Finance' },
    { id: 'cmd-withdraw', name: '/withdraw', code: `# Withdraw\nuser_id = Bot.getChatId()\nBot.sendMessage(user_id, "Withdraw menu")\n`, folder: 'Finance' },
    { id: 'cmd-settings', name: '/settings', code: `# Settings\nuser_id = Bot.getChatId()\nBot.sendMessage(user_id, "Bot Settings")\n`, folder: 'Settings' },
  ];

  const effectiveAllCommands = allCommands && allCommands.length > 0 ? allCommands : defaultCommandsList;

  // Filter commands for (+) search picker
  const filteredCommandsToOpen = effectiveAllCommands.filter((c) =>
    c.name.toLowerCase().includes(newTabSearch.toLowerCase())
  );

  return (
    <div
      id="telebot-fullscreen-ide"
      className={`fixed inset-0 z-50 w-screen h-screen flex flex-col overflow-hidden font-sans transition-colors duration-200 ${
        ideTheme === 'dark'
          ? 'bg-[#1e1e1e] text-slate-100'
          : 'bg-[#f8fafc] text-slate-900'
      }`}
      style={{ margin: 0, padding: 0 }}
    >
      {/* Visual Feedback Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-60 px-4 py-2 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* 1. COMMAND TABS: Clean VS Code styled tabs with scroll navigation for PC & mobile */}
      <div
        className={`flex items-stretch gap-0.5 border-b px-1.5 pt-1 shrink-0 overflow-hidden ${
          ideTheme === 'dark'
            ? 'bg-[#181818] border-[#2d2d30]'
            : 'bg-[#e2e8f0] border-slate-300'
        }`}
      >
        {/* Horizontal tabs container with smooth mouse wheel and touch scrolling */}
        <div
          ref={tabsScrollContainerRef}
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
          className={`flex items-stretch gap-1 overflow-x-auto flex-1 min-w-0 py-0.5 touch-pan-x overscroll-contain scrollbar-thin ${
            ideTheme === 'dark'
              ? 'scrollbar-thumb-[#3e3e42] scrollbar-track-[#181818]'
              : 'scrollbar-thumb-slate-400 scrollbar-track-slate-200'
          }`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {openTabs.map((tab) => {
            const isSelected = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                onMouseDown={(e) => {
                  if (e.button === 1) {
                    e.preventDefault();
                    handleCloseTab(e, tab.id);
                  }
                }}
                title={tab.name}
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-md cursor-pointer select-none whitespace-nowrap text-xs border border-b-0 transition-all duration-150 shrink-0 ${
                  isSelected
                    ? ideTheme === 'dark'
                      ? 'bg-[#1e1e1e] text-white border-[#333] border-t-2 border-t-blue-500 font-medium'
                      : 'bg-white text-slate-900 border-slate-300 border-t-2 border-t-blue-600 font-bold shadow-xs'
                    : ideTheme === 'dark'
                      ? 'bg-transparent text-gray-400 border-transparent hover:bg-[#252526] hover:text-gray-200'
                      : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-300/60 hover:text-slate-900'
                }`}
              >
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                  PY
                </span>
                <span className="max-w-[120px] sm:max-w-[160px] truncate font-mono">{tab.name}</span>
                {tab.isModified && (
                  <span
                    className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
                    title="Unsaved changes"
                  />
                )}
                {openTabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTab(e, tab.id);
                    }}
                    className="w-4 h-4 grid place-items-center rounded text-gray-400 hover:bg-black/10 dark:hover:bg-white/15 hover:text-red-500 dark:hover:text-white opacity-70 group-hover:opacity-100 transition cursor-pointer"
                    aria-label={`Close ${tab.name}`}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Tab button (Scroll left/right buttons removed per user request) */}
        <div className="flex items-center shrink-0 px-1">
          <button
            type="button"
            onClick={() => {
              setShowNewTabSelector(true);
              setTimeout(() => newTabSearchInputRef.current?.focus(), 50);
            }}
            title="Open or create command tab (+)"
            aria-label="Open or create command tab"
            className={`w-6 h-6 rounded-md transition-colors flex items-center justify-center cursor-pointer font-bold text-sm shadow-xs border ${
              ideTheme === 'dark'
                ? 'text-gray-300 hover:text-white bg-[#252526] hover:bg-[#333] border-[#3e3e42]'
                : 'text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-200 border-slate-300'
            }`}
          >
            +
          </button>
        </div>
      </div>

      {/* 2. COMPACT VS CODE TOOLBAR */}
      <header
        className={`py-1 px-2 sm:px-3 border-b flex items-center justify-between gap-1.5 shrink-0 min-h-[50px] ${
          ideTheme === 'dark'
            ? 'bg-[#252526] border-[#2d2d30]'
            : 'bg-slate-100 border-slate-300'
        }`}
      >
        {/* Left Side: Back button + Undo/Redo + Active File Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 border ${
              ideTheme === 'dark'
                ? 'bg-[#333337] hover:bg-[#3e3e42] text-gray-200 hover:text-white border-transparent'
                : 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Back to commands list"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Back</span>
          </button>

          <div className={`h-5 w-px ${ideTheme === 'dark' ? 'bg-[#3e3e42]' : 'bg-slate-300'}`} />

          {/* Undo / Redo strictly grouped */}
          <div
            className={`flex items-center gap-0.5 p-0.5 rounded-lg border shrink-0 ${
              ideTheme === 'dark'
                ? 'bg-[#1e1e1e] border-[#3e3e42]'
                : 'bg-white border-slate-300'
            }`}
          >
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              title={canUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo'}
              className={`p-1.5 rounded-md transition-colors ${
                canUndo
                  ? ideTheme === 'dark'
                    ? 'text-gray-200 hover:text-white hover:bg-[#333337] cursor-pointer'
                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100 cursor-pointer'
                  : 'text-gray-400 opacity-40 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              title={canRedo ? 'Redo (Ctrl+Y)' : 'Nothing to redo'}
              className={`p-1.5 rounded-md transition-colors ${
                canRedo
                  ? ideTheme === 'dark'
                    ? 'text-gray-200 hover:text-white hover:bg-[#333337] cursor-pointer'
                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100 cursor-pointer'
                  : 'text-gray-400 opacity-40 cursor-not-allowed'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Command indicator */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md border max-w-[130px] truncate ${
              ideTheme === 'dark'
                ? 'bg-[#1e1e1e] border-[#3e3e42]'
                : 'bg-white border-slate-300'
            }`}
          >
            <span className="text-[9px] font-bold px-1 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
              PY
            </span>
            <span className={`text-xs font-mono font-bold truncate ${ideTheme === 'dark' ? 'text-gray-200' : 'text-slate-800'}`}>
              {activeTab?.name}
            </span>
          </div>
        </div>

        {/* Center: Two compact horizontal rows positioned neatly in the middle */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1 min-w-0 px-1">
          {/* Top Row in Center: Paste, Syntax, Find & Replace, Word Wrap, Theme Switcher */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
            {/* Paste Code Button - strictly English */}
            <button
              type="button"
              onClick={handlePasteCodeDirect}
              title="Paste Code (Ctrl+V)"
              aria-label="Paste Code"
              className={`p-1.5 rounded-md border transition-all cursor-pointer shadow-xs ${
                ideTheme === 'dark'
                  ? 'bg-[#2d2d30] hover:bg-[#38383c] text-sky-300 hover:text-white border-sky-500/30'
                  : 'bg-white hover:bg-sky-50 text-sky-700 hover:text-sky-900 border-sky-300'
              }`}
            >
              <Clipboard className="w-3.5 h-3.5" />
            </button>

            {/* Check Syntax Button - strictly English */}
            <button
              type="button"
              onClick={handleCheckSyntax}
              title="Check Python Syntax"
              aria-label="Check Syntax"
              className={`p-1.5 rounded-md border transition-all cursor-pointer shadow-xs ${
                ideTheme === 'dark'
                  ? 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border-indigo-500/40'
                  : 'bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 border-indigo-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>

            {/* Find & Replace Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setShowSearch((prev) => {
                  const next = !prev;
                  if (next) setTimeout(() => searchInputRef.current?.focus(), 50);
                  return next;
                });
              }}
              title="Find & Replace (Ctrl+F)"
              aria-label="Find and Replace"
              className={`p-1.5 rounded-md transition-colors cursor-pointer border ${
                showSearch
                  ? 'bg-blue-600 text-white border-blue-500'
                  : ideTheme === 'dark'
                    ? 'bg-[#2d2d30] hover:bg-[#38383c] text-gray-300 hover:text-white border-[#3e3e42]'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Word Wrap Toggle */}
            <button
              type="button"
              onClick={() => setIsWordWrap(!isWordWrap)}
              title={`Toggle Word Wrap (${isWordWrap ? 'ON' : 'OFF'})`}
              className={`px-1.5 py-1 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer border flex items-center gap-1 ${
                isWordWrap
                  ? ideTheme === 'dark'
                    ? 'bg-[#3e3e42] text-blue-400 border-blue-500/40'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                  : ideTheme === 'dark'
                    ? 'bg-[#2d2d30] hover:bg-[#38383c] text-gray-400 hover:text-white border-[#3e3e42]'
                    : 'bg-white hover:bg-slate-200 text-slate-600 border-slate-300'
              }`}
            >
              <WrapText className="w-3 h-3" />
              <span className="hidden xs:inline">{isWordWrap ? 'ON' : 'OFF'}</span>
            </button>

            {/* Theme Toggle (Dark / Light) */}
            <button
              type="button"
              onClick={() => setIdeTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              title={ideTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
              className={`p-1.5 rounded-md transition-colors cursor-pointer border ${
                ideTheme === 'dark'
                  ? 'bg-[#2d2d30] hover:bg-[#38383c] text-amber-300 border-[#3e3e42]'
                  : 'bg-white hover:bg-amber-50 text-amber-600 border-slate-300'
              }`}
            >
              {ideTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Bottom Row in Center: Copy Code, Import .txt, Download .txt, Font Size Stepper */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
            {/* Copy Code Button */}
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copy all code to clipboard"
              aria-label="Copy Code"
              className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                ideTheme === 'dark'
                  ? 'bg-[#2d2d30] hover:bg-[#38383c] text-gray-300 hover:text-white border-[#3e3e42]'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Import .txt file */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Import script (.txt)"
              aria-label="Import Script"
              className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                ideTheme === 'dark'
                  ? 'bg-[#2d2d30] hover:bg-[#38383c] text-gray-300 hover:text-white border-[#3e3e42]'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            {/* Download .txt file */}
            <button
              type="button"
              onClick={handleDownloadScript}
              title="Download script as .txt"
              aria-label="Download Script"
              className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                ideTheme === 'dark'
                  ? 'bg-[#2d2d30] hover:bg-[#38383c] text-gray-300 hover:text-white border-[#3e3e42]'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Font Size Stepper: [-] 13px [+] (1-10: step 2, 11-30: step 1) */}
            <div
              className={`flex items-center rounded-md overflow-hidden text-xs border ${
                ideTheme === 'dark'
                  ? 'bg-[#2d2d30] border-[#3e3e42]'
                  : 'bg-white border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={handleDecreaseFontSize}
                disabled={fontSize <= 2}
                title="Decrease font size (-)"
                aria-label="Decrease Font Size"
                className={`px-1.5 py-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-bold ${
                  ideTheme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-[#38383c]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={() => setFontSize(DEFAULT_FONT_SIZE)}
                title={`Font size: ${fontSize}px (Click to reset to default ${DEFAULT_FONT_SIZE}px)`}
                className={`px-1.5 py-0.5 text-[10px] font-mono font-bold cursor-pointer select-none ${
                  ideTheme === 'dark' ? 'text-gray-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {fontSize}px
              </button>
              <button
                type="button"
                onClick={handleIncreaseFontSize}
                disabled={fontSize >= 30}
                title="Increase font size (+)"
                aria-label="Increase Font Size"
                className={`px-1.5 py-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-bold ${
                  ideTheme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-[#38383c]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Primary Save Button (Ctrl+S) - strictly pinned on the right */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            title={canSave ? 'Save changes (Ctrl+S)' : 'No unsaved changes'}
            className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0 ${
              canSave
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-blue-500/20'
                : ideTheme === 'dark'
                  ? 'bg-[#2a2a2d] text-gray-500 opacity-40 cursor-not-allowed border border-[#3e3e42]'
                  : 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed border border-slate-300'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* 3. RESPONSIVE FIND & REPLACE DRAWER */}
      {showSearch && (
        <div
          id="ide-search-drawer"
          className="px-3 py-2 bg-[#252526] border-b border-[#333] flex flex-wrap items-center gap-2 text-xs z-30 shadow-2xl"
        >
          {/* Find Input */}
          <div className="flex items-center gap-1.5 bg-[#1e1e1e] px-2.5 py-1.5 rounded-lg border border-[#3e3e42] flex-1 min-w-[170px]">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleFind(e.shiftKey);
                }
              }}
              placeholder="Find in file (Enter for next)..."
              className="bg-transparent text-white font-mono text-xs w-full focus:outline-none placeholder-gray-500"
              autoFocus
            />
            {searchQuery && (
              <span className="text-[10px] text-gray-400 shrink-0 font-mono px-1">
                {matchCount > 0 ? `${matchCount} found` : 'No match'}
              </span>
            )}
          </div>

          {/* Match Options: Case sensitive (Aa), Whole word (|ab|), Regex (.*) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMatchCase(!matchCase)}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer border ${
                matchCase
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-[#333337] text-gray-400 border-[#444] hover:text-white'
              }`}
              title="Match Case (Aa)"
            >
              Aa
            </button>
            <button
              type="button"
              onClick={() => setMatchWholeWord(!matchWholeWord)}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer border ${
                matchWholeWord
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-[#333337] text-gray-400 border-[#444] hover:text-white'
              }`}
              title="Match Whole Word (|ab|)"
            >
              |ab|
            </button>
            <button
              type="button"
              onClick={() => setUseRegex(!useRegex)}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer border ${
                useRegex
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-[#333337] text-gray-400 border-[#444] hover:text-white'
              }`}
              title="Regular Expression (.*)"
            >
              .*
            </button>
          </div>

          {/* Prev / Next Navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleFind(true)}
              className="p-1.5 rounded bg-[#333337] hover:bg-[#3e3e42] text-gray-300 hover:text-white border border-[#444] transition-colors cursor-pointer"
              title="Previous Match (Shift+Enter)"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFind(false)}
              className="p-1.5 rounded bg-[#333337] hover:bg-[#3e3e42] text-gray-300 hover:text-white border border-[#444] transition-colors cursor-pointer"
              title="Next Match (Enter)"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-[#444] mx-0.5 hidden sm:block" />

          {/* Replace Input */}
          <div className="flex items-center gap-1.5 bg-[#1e1e1e] px-2.5 py-1.5 rounded-lg border border-[#3e3e42] flex-1 min-w-[170px]">
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleReplace();
                }
              }}
              placeholder="Replace with..."
              className="bg-transparent text-white font-mono text-xs w-full focus:outline-none placeholder-gray-500"
            />
          </div>

          {/* Replace & Replace All Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReplace}
              className="px-2.5 py-1.5 rounded-lg bg-[#333337] hover:bg-[#3e3e42] text-gray-200 hover:text-white font-semibold text-xs cursor-pointer border border-[#444] transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleReplaceAll}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer transition-colors shadow-xs"
            >
              Replace All
            </button>
          </div>

          {/* Close Search Drawer */}
          <button
            type="button"
            onClick={() => {
              setShowSearch(false);
              aceEditorRef.current?.focus();
            }}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer ml-auto"
            title="Close Search (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. ACE CODE EDITOR WORKSPACE (Full Viewport Height) */}
      <div
        className="flex-1 w-full h-full relative overflow-hidden transition-colors"
        style={{ backgroundColor: ideTheme === 'dark' ? '#1e1e1e' : '#ffffff' }}
      >
        <div
          ref={editorContainerRef}
          id="telebot-studio-editor-viewport"
          className={`w-full h-full text-left ${ideTheme === 'light' ? 'ace-light-mode' : ''}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: ideTheme === 'dark' ? '#1e1e1e' : '#ffffff',
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        />
        <style>{`
          .ace-light-mode,
          .ace-light-mode .ace_scroller,
          .ace-light-mode .ace_content {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          .ace-light-mode .ace_gutter {
            background-color: #f8fafc !important;
            color: #64748b !important;
            border-right: 1px solid #e2e8f0 !important;
          }
          .ace-light-mode .ace_gutter-active-line {
            background-color: #e2e8f0 !important;
          }
          .ace-light-mode .ace_active-line {
            background-color: #f1f5f9 !important;
          }
          .ace-light-mode .ace_cursor {
            color: #0284c7 !important;
            border-left: 2px solid #0284c7 !important;
          }
          .ace-light-mode .ace_keyword {
            color: #b45309 !important;
            font-weight: 700;
          }
          .ace-light-mode .ace_string {
            color: #15803d !important;
          }
          .ace-light-mode .ace_comment {
            color: #64748b !important;
            font-style: italic;
          }
          .ace-light-mode .ace_constant.ace_numeric {
            color: #2563eb !important;
            font-weight: 600;
          }
          .ace-light-mode .ace_function {
            color: #7c3aed !important;
            font-weight: 600;
          }
          .ace-light-mode .ace_variable {
            color: #0f172a !important;
          }
          .ace-light-mode .ace_operator {
            color: #0284c7 !important;
            font-weight: 600;
          }
          .ace-light-mode .ace_marker-layer .ace_selection {
            background: #bae6fd !important;
          }
          .ace-light-mode .ace_marker-layer .ace_bracket {
            border: 1px solid #0284c7 !important;
          }
        `}</style>
      </div>

      {/* 5. MOBILE QUICK HELPER BAR (Touch Bar for fast Python typing on phones & tablets) */}
      <div className="flex sm:hidden items-center gap-1 px-2 py-1.5 bg-[#252526] border-t border-[#333] overflow-x-auto scrollbar-none shrink-0 text-xs font-mono select-none">
        <button
          type="button"
          onClick={() => handleInsertChar('    ')}
          className="px-2 py-1 rounded bg-[#333337] text-blue-300 font-bold hover:bg-[#3e3e42] shrink-0"
        >
          Tab
        </button>
        <button
          type="button"
          onClick={() => handleInsertChar(':')}
          className="w-7 h-7 rounded bg-[#333337] text-amber-300 font-bold flex items-center justify-center hover:bg-[#3e3e42] shrink-0"
        >
          :
        </button>
        <button
          type="button"
          onClick={() => handleInsertChar('()')}
          className="px-1.5 py-1 rounded bg-[#333337] text-gray-200 font-bold hover:bg-[#3e3e42] shrink-0"
        >
          ()
        </button>
        <button
          type="button"
          onClick={() => handleInsertChar('""')}
          className="px-1.5 py-1 rounded bg-[#333337] text-gray-200 font-bold hover:bg-[#3e3e42] shrink-0"
        >
          &quot;&quot;
        </button>
        <button
          type="button"
          onClick={() => handleInsertChar("''")}
          className="px-1.5 py-1 rounded bg-[#333337] text-gray-200 font-bold hover:bg-[#3e3e42] shrink-0"
        >
          &apos;&apos;
        </button>
        <button
          type="button"
          onClick={() => handleInsertChar('f""')}
          className="px-1.5 py-1 rounded bg-[#333337] text-emerald-300 font-bold hover:bg-[#3e3e42] shrink-0"
        >
          f&quot;&quot;
        </button>
        <button
          type="button"
          onClick={() => handleInsertChar(' = ')}
          className="px-1.5 py-1 rounded bg-[#333337] text-gray-200 font-bold hover:bg-[#3e3e42] shrink-0"
        >
          =
        </button>
        <button
          type="button"
          onClick={() => handleInsertChar(' == ')}
          className="px-1.5 py-1 rounded bg-[#333337] text-gray-200 font-bold hover:bg-[#3e3e42] shrink-0"
        >
          ==
        </button>
        <button
          type="button"
          onClick={() => handleInsertChar(' != ')}
          className="px-1.5 py-1 rounded bg-[#333337] text-gray-200 font-bold hover:bg-[#3e3e42] shrink-0"
        >
          !=
        </button>
        <button
          type="button"
          onClick={handleToggleComment}
          className="px-1.5 py-1 rounded bg-[#333337] text-amber-400 font-bold hover:bg-[#3e3e42] shrink-0"
          title="Toggle comment on current line"
        >
          #
        </button>
        <button
          type="button"
          onClick={handleDuplicateLine}
          className="px-2 py-1 rounded bg-[#333337] text-gray-300 font-sans font-medium hover:bg-[#3e3e42] shrink-0"
          title="Duplicate line down"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={handleDeleteLine}
          className="px-2 py-1 rounded bg-[#333337] text-rose-300 font-sans font-medium hover:bg-[#3e3e42] shrink-0"
          title="Delete current line"
        >
          Del Line
        </button>
        <button
          type="button"
          onClick={() => handleInsertCode('Bot.sendMessage(user_id, "Hello")\n')}
          className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 font-mono text-[11px] hover:bg-blue-500/20 shrink-0 border border-blue-500/20"
        >
          Bot.sendMessage
        </button>
        <button
          type="button"
          onClick={() => handleInsertCode('user_id = Bot.getChatId()\n')}
          className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 font-mono text-[11px] hover:bg-blue-500/20 shrink-0 border border-blue-500/20"
        >
          Bot.getChatId
        </button>
        <button
          type="button"
          onClick={handlePasteCodeDirect}
          className="px-2 py-1 rounded bg-[#333337] text-sky-300 font-sans font-bold hover:bg-[#3e3e42] shrink-0 border border-sky-500/20 flex items-center gap-1 cursor-pointer"
          title="Paste Code"
        >
          <Clipboard className="w-3 h-3" />
          <span>Paste</span>
        </button>
        <button
          type="button"
          onClick={handleCheckSyntax}
          className="px-2 py-1 rounded bg-indigo-600/30 text-indigo-200 font-sans font-bold hover:bg-indigo-600/50 shrink-0 border border-indigo-500/30 flex items-center gap-1 cursor-pointer"
          title="Check Syntax"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Syntax</span>
        </button>
      </div>

      {/* 6. STATUS BAR: Clean VS Code style status bar with live telemetry */}
      <footer className="h-7 px-3 sm:px-4 bg-[#007acc] text-white flex items-center justify-between text-[11px] font-mono shrink-0 select-none shadow-inner">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <span className="font-semibold">{activeMode.toUpperCase()} / TPY</span>
          <span className="opacity-60">•</span>
          <span>Spaces: 4</span>
          <span className="opacity-60 hidden sm:inline">•</span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="opacity-60 hidden md:inline">•</span>
          <button
            type="button"
            onClick={handleCheckSyntax}
            className="hidden md:flex items-center gap-1 hover:underline cursor-pointer opacity-90 hover:opacity-100 font-sans font-bold"
            title="Check Python Syntax & Lint"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Check Syntax</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span className="opacity-60">•</span>
          <span>{editorLineCount} lines</span>
          <span className="opacity-60 hidden sm:inline">•</span>
          {activeTab?.isModified ? (
            <span className="text-amber-200 font-bold hidden sm:inline">● Unsaved</span>
          ) : (
            <span className="text-emerald-200 font-bold hidden sm:inline">✓ Saved</span>
          )}
        </div>
      </footer>

      {/* 7. PLUS (+) COMMAND SELECTOR MODAL - Global popover to switch / create command tabs */}
      {showNewTabSelector && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewTabSelector(false);
          }}
        >
          <div
            ref={newTabDropdownRef}
            className="w-full max-w-lg bg-[#252526] border border-[#3e3e42] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] my-auto animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Search Header */}
            <div className="p-3 bg-[#1f1f20] border-b border-[#333] flex items-center justify-between gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={newTabSearchInputRef}
                  value={newTabSearch}
                  onChange={(e) => setNewTabSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowNewTabSelector(false);
                    if (e.key === 'Enter') {
                      if (filteredCommandsToOpen.length > 0) {
                        handleOpenCommandInTab(filteredCommandsToOpen[0]);
                      } else if (newTabSearch.trim()) {
                        handleCreateAndOpenCommand(newTabSearch.trim());
                      }
                    }
                  }}
                  placeholder="Type to search or create command (e.g. /deposit)..."
                  className="w-full bg-[#141416] border border-[#3e3e42] focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={() => setShowNewTabSelector(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Create Button when typing a unique command */}
            {newTabSearch.trim() &&
              !effectiveAllCommands.some(
                (c) => c.name.toLowerCase() === newTabSearch.toLowerCase().trim()
              ) && (
                <div className="p-2 border-b border-[#333] bg-blue-500/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCreateAndOpenCommand(newTabSearch.trim())}
                    className="w-full text-left px-3 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs font-semibold flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="font-mono truncate">
                      Create &quot;{newTabSearch.startsWith('/') ? newTabSearch : `/${newTabSearch}`}&quot;
                    </span>
                    <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-bold shrink-0 ml-2">
                      Add Tab
                    </span>
                  </button>
                </div>
              )}

            {/* Commands List Header */}
            <div className="px-3 py-2 bg-[#202022] border-b border-[#2d2d30] flex items-center justify-between text-[11px] shrink-0">
              <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                Available Commands ({filteredCommandsToOpen.length})
              </span>
              <span className="text-[10px] text-gray-500">Tap to open in editor tab</span>
            </div>

            {/* Commands List - Smooth touch scrolling across all mobile devices */}
            <div
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-2 space-y-1 scrollbar-thin"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {filteredCommandsToOpen.length === 0 ? (
                <div className="px-3 py-8 text-center text-xs text-gray-500">
                  No matching commands found. Press Enter or click above to create it!
                </div>
              ) : (
                filteredCommandsToOpen.map((cmd) => {
                  const b = getFileBadge(cmd.name, cmd.code);
                  const isOpen = openTabs.some((t) => t.id === cmd.id);
                  const isActive = activeTabId === cmd.id;

                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={() => handleOpenCommandInTab(cmd)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-200 border border-blue-500/30'
                          : 'hover:bg-[#333] text-gray-300 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                            b === 'TPY'
                              ? 'bg-violet-500/20 text-violet-300'
                              : 'bg-sky-500/20 text-sky-300'
                          }`}
                        >
                          {b}
                        </span>
                        <span className="font-mono font-bold truncate">{cmd.name}</span>
                        {cmd.folder && cmd.folder !== 'All' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e1e1e] text-gray-400 shrink-0">
                            {cmd.folder}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isActive ? (
                          <span className="text-[10px] text-blue-400 font-semibold">Active</span>
                        ) : isOpen ? (
                          <span className="text-[10px] text-gray-500">Open in Tab</span>
                        ) : (
                          <span className="text-[10px] text-gray-300 bg-[#1e1e20] px-2 py-0.5 rounded border border-[#3a3a3e]">
                            Open
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. SYNTAX CHECKER PANEL (Save / Check Syntax) */}
      <SyntaxCheckPanel
        isOpen={showSyntaxChecker}
        onClose={() => setShowSyntaxChecker(false)}
        result={syntaxResult}
        onJumpToLine={handleJumpToLine}
        commandName={activeTab?.name || '/start'}
      />

      {/* 9. DIRECT PASTE CODE MODAL (Paste Code) */}
      <PasteCodeModal
        isOpen={showPasteModal}
        onClose={() => setShowPasteModal(false)}
        onInsertCode={handleApplyPaste}
        currentCommandName={activeTab?.name || '/start'}
      />

      {/* Hidden file input for importing .txt files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadTxtFile}
        accept=".txt,text/plain"
        className="hidden"
      />
    </div>
  );
};
