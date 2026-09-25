import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Terminal,
  MessageSquare,
  Copy,
  Check,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  simulateTelebotExecution,
  SimulationContext,
  SimulationResult,
  SimulatedMessage,
} from '../utils/telebotSimulator';

interface TelebotTesterPanelProps {
  code: string;
  commandName: string;
  botName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TelebotTesterPanel: React.FC<TelebotTesterPanelProps> = ({
  code,
  commandName,
  botName,
  isOpen,
  onClose,
}) => {
  const [testMessage, setTestMessage] = useState<string>(commandName || '/start');
  const [testChatId, setTestChatId] = useState<number>(123456789);
  const [testUsername, setTestUsername] = useState<string>('telebot_tester');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // Keep testMessage in sync when command changes
  useEffect(() => {
    if (commandName) {
      setTestMessage(commandName);
    }
  }, [commandName]);

  // Run simulation
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = (overrideMsg?: string, callbackData?: string) => {
    setIsRunning(true);
    const ctx: SimulationContext = {
      chatId: testChatId,
      username: testUsername,
      firstName: 'Test User',
      messageText: overrideMsg !== undefined ? overrideMsg : testMessage,
      callbackData,
    };

    // Small delay to provide nice responsive feeling
    setTimeout(() => {
      const res = simulateTelebotExecution(code, ctx);
      setSimResult(res);
      setIsRunning(false);
    }, 60);
  };

  // Run test automatically when panel opens or code changes while open
  useEffect(() => {
    if (isOpen) {
      runTest();
    }
  }, [isOpen]);

  const handleCopyLogs = () => {
    if (!simResult) return;
    const text = [
      `=== TELEBOT TEST RUN LOGS ===`,
      `Time: ${new Date().toISOString()}`,
      `Execution Time: ${simResult.executionTimeMs}ms`,
      `Status: ${simResult.success ? 'SUCCESS' : 'FAILED'}`,
      `\n--- CONSOLE LOGS ---`,
      ...simResult.logs,
      ...(simResult.errors.length > 0 ? ['\n--- ERRORS ---', ...simResult.errors] : []),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] md:w-[540px] bg-[#1a1a1c] border-l border-[#333] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-12 px-4 bg-[#212124] border-b border-[#2d2d30] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            <Play className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Code Tester & Simulation</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                {commandName}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => runTest()}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            title="Re-run Test"
          >
            <RotateCcw className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Test Again</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
            title="Close Tester"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Test Controls & Trigger Input */}
      <div className="p-3 bg-[#1e1e21] border-b border-[#2d2d30] space-y-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runTest();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Simulated incoming message (e.g. /start)"
              className="w-full bg-[#141416] border border-[#3e3e42] focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isRunning}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </form>

        {/* Collapsible Test Environment Variables */}
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-2 font-mono">
            <span>User: @{testUsername}</span>
            <span>•</span>
            <span>ID: {testChatId}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>{showConfig ? 'Hide Settings' : 'Customize Context'}</span>
            {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showConfig && (
          <div className="p-2.5 rounded-lg bg-[#141416] border border-[#333] grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Chat ID</label>
              <input
                type="number"
                value={testChatId}
                onChange={(e) => setTestChatId(Number(e.target.value))}
                className="w-full bg-[#1f1f23] border border-[#333] rounded px-2 py-1 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Username</label>
              <input
                type="text"
                value={testUsername}
                onChange={(e) => setTestUsername(e.target.value)}
                className="w-full bg-[#1f1f23] border border-[#333] rounded px-2 py-1 text-xs text-white font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Results Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Card */}
        {simResult && (
          <div
            className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
              simResult.success
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {simResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold">
                  {simResult.success ? 'Execution Succeeded' : 'Simulation Failed / Error'}
                </h4>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Completed in <span className="font-mono font-bold">{simResult.executionTimeMs}ms</span> •{' '}
                  {simResult.messages.length} outgoing message(s) generated
                </p>
              </div>
            </div>

            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                simResult.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {simResult.success ? '200 OK' : 'ERR'}
            </span>
          </div>
        )}

        {/* Syntax & Runtime Errors Display */}
        {simResult && simResult.errors.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-1.5">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
              Errors & Exceptions:
            </span>
            {simResult.errors.map((err, idx) => (
              <div key={idx} className="text-xs font-mono text-rose-200 bg-rose-900/30 p-2 rounded">
                {err}
              </div>
            ))}
          </div>
        )}

        {/* Syntax Warnings */}
        {simResult && simResult.syntaxWarnings.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              Syntax Warnings:
            </span>
            {simResult.syntaxWarnings.map((warn, idx) => (
              <div key={idx} className="text-xs font-mono text-amber-200/90">
                • {warn}
              </div>
            ))}
          </div>
        )}

        {/* Interactive Telegram Chat Bubble Simulator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Simulated Telegram Chat</span>
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Live Preview</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1621] border border-[#232e3c] min-h-[160px] space-y-3 flex flex-col justify-end shadow-inner">
            {/* User message sent */}
            <div className="self-end max-w-[85%] p-2.5 rounded-2xl rounded-tr-xs bg-[#2b5278] text-white text-xs shadow">
              <div className="font-mono break-words">{testMessage}</div>
              <div className="text-[9px] text-right text-blue-200/70 mt-1">Just now ✓✓</div>
            </div>

            {/* Outgoing bot messages */}
            {simResult && simResult.messages.length > 0 ? (
              simResult.messages.map((msg) => (
                <div
                  key={msg.id}
                  className="self-start max-w-[88%] p-3 rounded-2xl rounded-tl-xs bg-[#182533] text-gray-100 text-xs shadow-md border border-[#2b3a4a]/40 space-y-2.5"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400">
                    <span>{botName}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                      BOT
                    </span>
                  </div>

                  {/* Photo if sent */}
                  {msg.photoUrl && (
                    <div className="rounded-lg overflow-hidden border border-[#2b3a4a]">
                      <img
                        src={msg.photoUrl}
                        alt="Bot Photo"
                        className="w-full max-h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Text content */}
                  <div className="font-sans whitespace-pre-wrap leading-relaxed text-gray-100 text-xs">
                    {msg.text}
                  </div>

                  {/* Inline keyboard buttons */}
                  {msg.inlineKeyboard && msg.inlineKeyboard.length > 0 && (
                    <div className="pt-1.5 space-y-1">
                      {msg.inlineKeyboard.map((row, rowIdx) => (
                        <div key={rowIdx} className="flex gap-1.5 w-full">
                          {row.map((btn, btnIdx) => (
                            <button
                              key={btnIdx}
                              type="button"
                              onClick={() => {
                                if (btn.callback_data) {
                                  runTest(btn.callback_data, btn.callback_data);
                                }
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-[#243447] hover:bg-[#2e425a] text-blue-300 text-xs font-semibold text-center truncate transition cursor-pointer border border-[#2b3a4a] active:scale-98"
                              title={btn.callback_data ? `Callback: ${btn.callback_data}` : btn.url}
                            >
                              {btn.text}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[9px] text-right text-gray-400">{msg.timestamp}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-gray-500">
                {simResult?.success
                  ? 'The command executed successfully without outputting a message (e.g. storage or state update).'
                  : 'Click "Test Again" or Send a message above to test this script.'}
              </div>
            )}
          </div>
        </div>

        {/* Execution Logs Trace */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Execution Logs & API Calls</span>
            </span>

            <button
              type="button"
              onClick={handleCopyLogs}
              className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedLogs ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Logs</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-[#121214] border border-[#2d2d30] font-mono text-[11px] text-gray-300 space-y-1 max-h-48 overflow-y-auto">
            {simResult && simResult.logs.length > 0 ? (
              simResult.logs.map((log, idx) => (
                <div key={idx} className="leading-snug text-gray-300 break-all">
                  <span className="text-gray-500 mr-2">{idx + 1}</span>
                  {log}
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">No execution logs recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
