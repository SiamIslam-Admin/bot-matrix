import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-90 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto overscroll-contain animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isDestructive
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                {isDestructive ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {title}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed font-medium">
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              <span>{confirmText}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
