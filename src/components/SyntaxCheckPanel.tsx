import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { SyntaxCheckResult, SyntaxErrorItem } from '../utils/pythonSyntaxChecker';

interface SyntaxCheckPanelProps {
  isOpen: boolean;
  onClose: () => void;
  result: SyntaxCheckResult;
  onJumpToLine?: (line: number, column?: number) => void;
  commandName: string;
}

export const SyntaxCheckPanel: React.FC<SyntaxCheckPanelProps> = ({
  isOpen,
  onClose,
  result,
  onJumpToLine,
  commandName,
}) => {
  if (!isOpen) return null;

  const totalIssues = result.errors.length + result.warnings.length;

  return (
    <div className="fixed inset-0 z-70 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-[#252526] border border-[#3e3e42] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-[#1f1f20] border-b border-[#333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {result.isValid ? (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Syntax Check</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#333] text-gray-400">
                  {commandName}
                </span>
              </h3>
              <p className="text-[10px] text-gray-400">
                {result.isValid
                  ? 'Python syntax verification passed'
                  : `${result.errors.length} error(s), ${result.warnings.length} warning(s) found`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto space-y-3 max-h-[60vh]">
          {result.isValid && result.warnings.length === 0 ? (
            <div className="py-8 px-4 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-emerald-300 mb-1">
                Syntax is 100% Valid!
              </h4>
              <p className="text-xs text-gray-400 max-w-sm">
                No indentation errors, unclosed brackets, missing colons, or syntax violations detected in this script.
              </p>
            </div>
          ) : (
            <>
              {/* Errors List */}
              {result.errors.map((err, idx) => (
                <div
                  key={`err-${idx}`}
                  className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        Line {err.line}, Col {err.column}
                      </span>
                    </div>

                    {onJumpToLine && (
                      <button
                        type="button"
                        onClick={() => {
                          onJumpToLine(err.line, err.column);
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <span>Go to Line</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-rose-200 font-medium">{err.message}</p>

                  {err.snippet && (
                    <div className="p-1.5 rounded bg-[#1e1e1e] text-[11px] font-mono text-gray-300 truncate">
                      {err.snippet}
                    </div>
                  )}

                  {err.suggestion && (
                    <p className="text-[11px] text-rose-300/80">
                      💡 <strong>Suggestion</strong> {err.suggestion}
                    </p>
                  )}
                </div>
              ))}

              {/* Warnings List */}
              {result.warnings.map((warn, idx) => (
                <div
                  key={`warn-${idx}`}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        Line {warn.line}, Col {warn.column}
                      </span>
                    </div>

                    {onJumpToLine && (
                      <button
                        type="button"
                        onClick={() => {
                          onJumpToLine(warn.line, warn.column);
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <span>Go to Line</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-amber-200 font-medium">{warn.message}</p>

                  {warn.snippet && (
                    <div className="p-1.5 rounded bg-[#1e1e1e] text-[11px] font-mono text-gray-300 truncate">
                      {warn.snippet}
                    </div>
                  )}

                  {warn.suggestion && (
                    <p className="text-[11px] text-amber-300/80">
                      💡 <strong>Suggestion</strong> {warn.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1f1f20] border-t border-[#333] flex items-center justify-between text-xs text-gray-400">
          <span>{totalIssues === 0 ? '✓ Ready to run' : `${totalIssues} issue(s) detected`}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#333] hover:bg-[#444] text-white font-medium cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
