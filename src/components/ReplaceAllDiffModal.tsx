import React, { useState } from 'react';
import { X, Check, ArrowRight, AlertTriangle, FileCode, CheckSquare, Square } from 'lucide-react';
import { BotCommand } from '../types';

export interface CommandDiffPreview {
  command: BotCommand;
  occurrences: number;
  originalCode: string;
  replacedCode: string;
  diffLines: Array<{
    lineNumber: number;
    original: string;
    replaced: string;
  }>;
}

interface ReplaceAllDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedCommandIds: string[]) => void;
  searchQuery: string;
  replaceText: string;
  previews: CommandDiffPreview[];
}

export const ReplaceAllDiffModal: React.FC<ReplaceAllDiffModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  searchQuery,
  replaceText,
  previews,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => previews.map((p) => p.command.id));

  if (!isOpen) return null;

  const totalOccurrences = previews
    .filter((p) => selectedIds.includes(p.command.id))
    .reduce((acc, p) => acc + p.occurrences, 0);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(previews.map((p) => p.command.id));
  const deselectAll = () => setSelectedIds([]);

  return (
    <div
      className="fixed inset-0 z-80 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overscroll-contain animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-[#252526] border-b border-slate-200 dark:border-[#333] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Confirm Replace All</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                  {totalOccurrences} matches in {selectedIds.length} command{selectedIds.length === 1 ? '' : 's'}
                </span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono truncate">
                <span className="px-1.5 py-0.2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded border border-rose-500/20 max-w-[140px] truncate">
                  {searchQuery}
                </span>
                <ArrowRight className="w-3 h-3 shrink-0 text-slate-400" />
                <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/20 max-w-[140px] truncate">
                  {replaceText || '(empty / delete)'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selection Toolbar */}
        <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-[#181818] border-b border-slate-200 dark:border-[#2d2d30] flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            Review code changes before applying:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Select All ({previews.length})
            </button>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-[11px] font-semibold text-slate-500 hover:underline cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Previews List with Syntax Diff */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {previews.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching occurrences found to replace.
            </div>
          ) : (
            previews.map((preview) => {
              const isChecked = selectedIds.includes(preview.command.id);

              return (
                <div
                  key={preview.command.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isChecked
                      ? 'border-blue-300 dark:border-blue-900/60 bg-white dark:bg-[#252526] shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 opacity-60'
                  }`}
                >
                  {/* Command Header */}
                  <div
                    onClick={() => toggleSelect(preview.command.id)}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-[#1e1e1e] border-b border-slate-200 dark:border-[#2d2d30] flex items-center justify-between gap-2 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(preview.command.id);
                        }}
                        className="text-blue-600 dark:text-blue-400 cursor-pointer shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                        {preview.command.name}
                      </span>
                      {preview.command.folder && preview.command.folder !== 'All' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {preview.command.folder}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 font-mono">
                      {preview.occurrences} {preview.occurrences === 1 ? 'match' : 'matches'}
                    </span>
                  </div>

                  {/* Diff Lines View */}
                  <div className="p-3 space-y-2 font-mono text-[11px] leading-relaxed">
                    {preview.diffLines.map((diff, dIdx) => (
                      <div
                        key={`diff-${dIdx}`}
                        className="rounded-lg border border-slate-200 dark:border-[#333] overflow-hidden bg-slate-900 text-slate-200"
                      >
                        <div className="px-2.5 py-1 bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-between border-b border-slate-700">
                          <span>Line {diff.lineNumber}</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-500">Syntax Diff</span>
                        </div>

                        {/* Red: Original */}
                        <div className="px-2.5 py-1.5 bg-rose-950/40 text-rose-200 flex items-start gap-2 border-b border-rose-900/30 overflow-x-auto whitespace-pre-wrap">
                          <span className="text-rose-400 select-none font-bold shrink-0">-</span>
                          <span>{diff.original}</span>
                        </div>

                        {/* Green: Replaced */}
                        <div className="px-2.5 py-1.5 bg-emerald-950/40 text-emerald-200 flex items-start gap-2 overflow-x-auto whitespace-pre-wrap">
                          <span className="text-emerald-400 select-none font-bold shrink-0">+</span>
                          <span>{diff.replaced}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#252526] border-t border-slate-200 dark:border-[#333] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={selectedIds.length === 0 || totalOccurrences === 0}
            onClick={() => onConfirm(selectedIds)}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition"
          >
            <Check className="w-4 h-4" />
            <span>Apply Changes ({totalOccurrences} matches)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
