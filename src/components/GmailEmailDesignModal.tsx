import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Copy,
  Check,
  Code2,
  Eye,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { generateGmailOtpTemplateHtml } from '../utils/gmailEmailTemplate';

interface GmailEmailDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  userName?: string;
  otpCode: string;
}

export const GmailEmailDesignModal: React.FC<GmailEmailDesignModalProps> = ({
  isOpen,
  onClose,
  email,
  userName,
  otpCode,
}) => {
  const [activeView, setActiveView] = useState<'preview' | 'html'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlCode = generateGmailOtpTemplateHtml({
    email,
    userName,
    otpCode: otpCode || '123456',
    expiryMinutes: 10,
    appName: 'Bot Matrix',
  });

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="glass-panel w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Gmail OTP Message Design</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    Real Template
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Visual layout of the security email dispatched to recipient's Gmail inbox
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Toolbar */}
          <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeView === 'preview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inbox Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('html')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeView === 'html'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>HTML Code (For Backend SMTP)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyHtml}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied HTML!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Copy HTML</span>
                </>
              )}
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-950">
            {activeView === 'preview' ? (
              <div className="space-y-3">
                {/* Simulated Gmail Message Envelope */}
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                    <span className="font-mono">Google Mail • Message Delivery</span>
                    <span>Just now</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-slate-400">From:</span>
                    <span className="text-slate-200 font-mono text-[11px]">
                      Bot Matrix Security &lt;security@botmatrix.app&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">To:</span>
                    <span className="text-blue-400 font-mono text-[11px] font-bold">
                      {email || 'siamislam654321@gmail.com'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">Subject:</span>
                    <span className="text-slate-200 font-semibold text-[11px]">
                      🔐 Your Bot Matrix Verification Code ({otpCode || '123456'})
                    </span>
                  </div>
                </div>

                {/* Live rendered HTML Iframe */}
                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner">
                  <iframe
                    title="Gmail Email Template Preview"
                    srcDoc={htmlCode}
                    className="w-full h-[460px] border-none"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            ) : (
              /* Raw HTML Code View for developer/user backend integration */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Copy this HTML directly into your backend mailer (Nodemailer, SendGrid, Resend, or AWS SES):
                  </span>
                </div>
                <div className="relative">
                  <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-blue-300 overflow-x-auto max-h-[460px] select-all leading-relaxed">
                    {htmlCode}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Production-ready for all modern email clients</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors"
            >
              Close Preview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
