import React, { useState, useRef, useEffect } from 'react';
import { Clipboard, X, Check, ArrowDownToLine, RefreshCw } from 'lucide-react';

interface PasteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCode: (code: string, replaceAll: boolean) => void;
  currentCommandName: string;
}

export const PasteCodeModal: React.FC<PasteCodeModalProps> = ({
  isOpen,
  onClose,
  onInsertCode,
  currentCommandName,
}) => {
  const [pasteText, setPasteText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPasteText('');
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = (replaceAll: boolean) => {
    if (!pasteText.trim()) return;
    onInsertCode(pasteText, replaceAll);
    onClose();
  };

  const handleTryNativePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setPasteText(clipText);
      }
    } catch {
      // Ignore if permission denied
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-[#252526] border border-[#3e3e42] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-[#1f1f20] border-b border-[#333] flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Clipboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold flex items-center gap-2">
                <span>Paste Code</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#333] text-gray-400">
                  {currentCommandName}
                </span>
              </h3>
              <p className="text-[10px] text-gray-400">
                Paste your Python or Telebot code directly into the editor
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

        {/* Body Textarea */}
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-300">
              Paste or type your script code below:
            </label>
            <button
              type="button"
              onClick={handleTryNativePaste}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Clipboard className="w-3 h-3" />
              <span>Read Clipboard</span>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste python / telebot code here... (e.g. Bot.sendMessage(user_id, 'Hello'))"
            rows={10}
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] focus:border-blue-500 rounded-xl p-3 text-xs font-mono text-gray-100 placeholder-gray-500 focus:outline-none resize-none leading-relaxed"
          />

          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>{pasteText.length} characters</span>
            <span>{pasteText.split('\n').filter(Boolean).length} lines</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-4 py-3 bg-[#1f1f20] border-t border-[#333] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#333] hover:bg-[#444] text-gray-300 hover:text-white text-xs font-medium cursor-pointer transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pasteText.trim()}
              onClick={() => handleApply(false)}
              className="px-3 py-1.5 rounded-lg bg-[#333337] hover:bg-[#3e3e42] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition border border-[#444]"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Insert at Cursor</span>
            </button>

            <button
              type="button"
              disabled={!pasteText.trim()}
              onClick={() => handleApply(true)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Replace All Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
