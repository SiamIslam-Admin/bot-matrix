import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trash2,
  AlertTriangle,
  RotateCcw,
  X,
  Archive,
  Check,
  Terminal,
  Folder,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { BotCommand } from '../types';

interface DeleteCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands?: BotCommand[];
  commandsToDelete?: BotCommand[];
  onConfirmMoveToTrash: () => void;
  onConfirmPermanentDelete: () => void;
}

export const DeleteCommandModal: React.FC<DeleteCommandModalProps> = ({
  isOpen,
  onClose,
  commands,
  commandsToDelete,
  onConfirmMoveToTrash,
  onConfirmPermanentDelete,
}) => {
  const [deleteMode, setDeleteMode] = useState<'trash' | 'permanent'>('trash');
  const [confirmPermanentText, setConfirmPermanentText] = useState('');

  const targetList = commands || commandsToDelete || [];

  if (!isOpen || targetList.length === 0) return null;

  const count = targetList.length;
  const isSingle = count === 1;
  const singleCmd = targetList[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto overscroll-contain animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed & docked */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                deleteMode === 'trash'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              }`}
            >
              {deleteMode === 'trash' ? (
                <Archive className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                {isSingle ? `Delete "${singleCmd.name}"` : `Delete ${count} Commands`}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {deleteMode === 'trash'
                  ? 'Safe move to Archive Bin (restorable)'
                  : 'Permanent irreversible deletion'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-3.5 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4 text-xs overflow-y-auto min-h-0 flex-1 overscroll-contain">
          {/* Mode Switcher Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setDeleteMode('trash')}
              className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                deleteMode === 'trash'
                  ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-500/25'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Archive className="w-3.5 h-3.5 text-amber-500" />
                  <span>Archive Bin</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Moves to Deleted Bin. 1-click restore anytime from Bot Studio.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDeleteMode('permanent')}
              className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                deleteMode === 'permanent'
                  ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 ring-2 ring-rose-500/25'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Permanent</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  Danger
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Immediately erases source code. Cannot be recovered once executed.
              </p>
            </button>
          </div>

          {/* Itemized Command Chips Preview */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Target Commands ({count})</span>
              <span>Folder Category</span>
            </div>
            <div className="space-y-1.5 max-h-32 sm:max-h-44 overflow-y-auto pr-1 scrollbar-thin">
              {targetList.map((cmd) => (
                <div
                  key={cmd.id}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Terminal className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white truncate">
                      {cmd.name}
                    </span>
                    {cmd.aliases && cmd.aliases.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono hidden sm:inline">
                        +{cmd.aliases.length} alias
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 shrink-0 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                    {cmd.folder || 'All'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Permanent Confirmation Input */}
          {deleteMode === 'permanent' && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Type DELETE to confirm:
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmPermanentText('DELETE')}
                  className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Autofill
                </button>
              </div>
              <input
                type="text"
                value={confirmPermanentText}
                onChange={(e) => setConfirmPermanentText(e.target.value.toUpperCase())}
                placeholder="Type DELETE"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-400/50 text-slate-900 dark:text-white font-mono text-xs focus:outline-none uppercase font-bold"
              />
            </div>
          )}
        </div>

        {/* Footer Actions - Always visible & docked */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer transition text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleteMode === 'permanent' && confirmPermanentText !== 'DELETE'}
            onClick={() => {
              if (deleteMode === 'trash') {
                onConfirmMoveToTrash();
              } else {
                onConfirmPermanentDelete();
              }
            }}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              deleteMode === 'trash'
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20 active:scale-98'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 active:scale-98'
            }`}
          >
            {deleteMode === 'trash' ? (
              <Archive className="w-3.5 h-3.5" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>
              {deleteMode === 'trash'
                ? `Move to Archive Bin (${count})`
                : `Permanently Delete (${count})`}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
