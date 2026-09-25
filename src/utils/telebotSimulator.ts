/**
 * Telebot Script Execution Simulator & Syntax Validator
 * Provides safe client-side execution simulation of Telebot Python scripts,
 * capturing outgoing Telegram API messages, inline keyboards, prints, and errors.
 */

export interface SimulatedInlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface SimulatedMessage {
  id: string;
  chatId: string | number;
  text: string;
  photoUrl?: string;
  caption?: string;
  inlineKeyboard?: SimulatedInlineButton[][];
  timestamp: string;
  parseMode?: string;
}

export interface SimulationResult {
  success: boolean;
  executionTimeMs: number;
  messages: SimulatedMessage[];
  logs: string[];
  errors: string[];
  syntaxWarnings: string[];
}

export interface SimulationContext {
  chatId: number;
  username: string;
  firstName: string;
  messageText: string;
  callbackData?: string;
}

/**
 * Validates Python / Telebot / JS code for common syntax errors and pitfalls
 */
export function validatePythonSyntax(code: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!code || !code.trim()) {
    return { errors, warnings };
  }

  // Detect JavaScript / BJS syntax
  const isJavaScript =
    /^\s*\/\//m.test(code) ||
    /\b(function|const|let|var)\b/.test(code) ||
    /=>/.test(code) ||
    /\bif\s*\(/.test(code) ||
    /;\s*$/m.test(code);

  if (isJavaScript) {
    try {
      new Function('Bot', 'user', 'user_id', 'ADMIN_IDS', 'params', 'Libs', 'User', code);
    } catch (err: any) {
      errors.push(`JavaScript SyntaxError: ${err.message || String(err)}`);
    }
    return { errors, warnings };
  }

  const lines = code.split('\n');

  let openParen = 0;
  let openBracket = 0;
  let openBrace = 0;
  let inMultiQuote: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check for unclosed multiline strings
    if (trimmed.includes('"""') || trimmed.includes("'''")) {
      const q = trimmed.includes('"""') ? '"""' : "'''";
      const count = (rawLine.match(new RegExp(q, 'g')) || []).length;
      if (count % 2 !== 0) {
        inMultiQuote = inMultiQuote === q ? null : q;
      }
    }

    if (inMultiQuote || trimmed.startsWith('#') || !trimmed) {
      continue;
    }

    // Strip line comments
    const codePart = trimmed.split('#')[0].trim();

    // Check for missing colons on statement blocks
    if (
      /^(if|elif|else|def|while|for|try|except|finally|class)\b/.test(codePart) &&
      !codePart.endsWith(':') &&
      !codePart.endsWith('\\')
    ) {
      errors.push(`Line ${lineNum}: Missing colon ':' at the end of '${codePart.slice(0, 24)}...'`);
    }

    // Check bracket parity (approximate check outside quotes)
    let inSingleQuote = false;
    let inDoubleQuote = false;
    for (let c = 0; c < codePart.length; c++) {
      const ch = codePart[c];
      const prev = c > 0 ? codePart[c - 1] : '';

      if (ch === "'" && prev !== '\\' && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (ch === '"' && prev !== '\\' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      } else if (!inSingleQuote && !inDoubleQuote) {
        if (ch === '(') openParen++;
        else if (ch === ')') openParen--;
        else if (ch === '[') openBracket++;
        else if (ch === ']') openBracket--;
        else if (ch === '{') openBrace++;
        else if (ch === '}') openBrace--;
      }
    }

    if (inSingleQuote || inDoubleQuote) {
      warnings.push(`Line ${lineNum}: Possible unclosed string quote on line.`);
    }

    // Detect common Telebot mistake: assigning instead of calling getChatId
    if (codePart.includes('Bot.getChatId') && !codePart.includes('Bot.getChatId()')) {
      warnings.push(`Line ${lineNum}: 'Bot.getChatId' should be invoked with parentheses: 'Bot.getChatId()'`);
    }
  }

  if (openParen !== 0) errors.push(`Unmatched parentheses '(' - count difference: ${openParen}`);
  if (openBracket !== 0) errors.push(`Unmatched square brackets '[' - count difference: ${openBracket}`);
  if (openBrace !== 0) errors.push(`Unmatched curly braces '{' - count difference: ${openBrace}`);

  return { errors, warnings };
}

/**
 * Runs a simulated execution of a Telebot script with mock incoming Telegram data.
 */
export function simulateTelebotExecution(
  code: string,
  context: SimulationContext
): SimulationResult {
  const startTime = performance.now();
  const messages: SimulatedMessage[] = [];
  const logs: string[] = [];
  const errors: string[] = [];

  // 1. First run syntax validation
  const { errors: syntaxErrors, warnings: syntaxWarnings } = validatePythonSyntax(code);
  if (syntaxErrors.length > 0) {
    return {
      success: false,
      executionTimeMs: Math.round(performance.now() - startTime),
      messages: [],
      logs: ['Syntax validation failed before execution.'],
      errors: syntaxErrors,
      syntaxWarnings,
    };
  }

  // 2. Simulated Storage State
  const storage: Record<string, unknown> = {
    PAYMENT_GATEWAY: 'CryptoBot/XRocket',
    balance: '150.00',
    INTERNAL_TOKEN: 'node_live_tok_99182',
  };

  const adminList = ['61829103', '5478832701', '15519993', String(context.chatId)];

  // 3. Virtual Bot Environment
  const Bot = {
    getChatId: () => context.chatId,
    getMessageText: () => context.messageText,
    getUsername: () => context.username,
    getUser: () => ({
      id: context.chatId,
      username: context.username,
      first_name: context.firstName,
      is_bot: false,
    }),
    getChat: () => ({
      id: context.chatId,
      type: 'private',
      username: context.username,
      first_name: context.firstName,
    }),
    getCallbackData: () => context.callbackData || '',

    // Telebot Admin verification helper
    isAdmin: () => true,

    // Bot properties get/set
    getProperty: (key: string, defaultValue?: unknown) => {
      return storage[key] !== undefined ? storage[key] : (defaultValue ?? null);
    },
    setProperty: (key: string, value: unknown) => {
      storage[key] = value;
      logs.push(`[Bot.setProperty] ${key} = ${JSON.stringify(value)}`);
    },

    // Supports both (text, options) and (chatId, text, options)
    sendMessage: (
      arg1: number | string,
      arg2?: any,
      arg3?: any
    ) => {
      let targetChatId: string | number = context.chatId;
      let text = '';
      let options: any = undefined;

      if (arg3 !== undefined) {
        targetChatId = arg1;
        text = String(arg2 ?? '');
        options = arg3;
      } else if (arg2 !== undefined) {
        if (typeof arg1 === 'number' || (!isNaN(Number(arg1)) && typeof arg2 === 'string')) {
          targetChatId = arg1;
          text = String(arg2 ?? '');
        } else {
          targetChatId = context.chatId;
          text = String(arg1 ?? '');
          options = arg2;
        }
      } else {
        targetChatId = context.chatId;
        text = String(arg1 ?? '');
      }

      const inlineButtons = options?.reply_markup?.inline_keyboard || undefined;

      const msg: SimulatedMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        chatId: targetChatId,
        text: String(text ?? ''),
        inlineKeyboard: inlineButtons,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parseMode: options?.parse_mode || 'Markdown',
      };
      messages.push(msg);
      logs.push(`[Bot.sendMessage] To: ${targetChatId} | Text: "${String(text).slice(0, 60)}"`);
      return { message_id: Math.floor(Math.random() * 100000) };
    },

    sendInlineKeyboard: (
      chatId: number | string,
      text: string,
      buttons: Array<Array<{ text: string; callback_data?: string; url?: string }>>
    ) => {
      const msg: SimulatedMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        chatId,
        text: String(text ?? ''),
        inlineKeyboard: buttons,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      messages.push(msg);
      logs.push(`[Bot.sendInlineKeyboard] To: ${chatId} | Buttons: ${buttons?.flat()?.length || 0}`);
      return { message_id: Math.floor(Math.random() * 100000) };
    },

    sendPhoto: (chatId: number | string, photoUrl: string, caption?: string) => {
      const msg: SimulatedMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        chatId,
        text: caption || '',
        photoUrl,
        caption,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      messages.push(msg);
      logs.push(`[Bot.sendPhoto] To: ${chatId} | Photo: ${photoUrl}`);
      return { message_id: Math.floor(Math.random() * 100000) };
    },

    editMessage: (chatId: number | string, _messageId: number | string, newText: string) => {
      logs.push(`[Bot.editMessage] Chat: ${chatId} | New Text: "${newText}"`);
      return true;
    },

    setStorage: (key: string, value: unknown) => {
      storage[key] = value;
      logs.push(`[Bot.setStorage] ${key} = ${JSON.stringify(value)}`);
    },

    getStorage: (key: string) => {
      return storage[key];
    },

    runCommand: (cmdName: string) => {
      logs.push(`[Bot.runCommand] Triggered command: ${cmdName}`);
    },
  };

  const User = {
    getProperty: (key: string, defaultValue?: unknown) => {
      return storage[`user_${key}`] !== undefined ? storage[`user_${key}`] : (defaultValue ?? null);
    },
    setProperty: (key: string, value: unknown) => {
      storage[`user_${key}`] = value;
    },
  };

  const Libs = {
    Webhooks: {
      post: (url: string, payload: unknown) => {
        logs.push(`[Libs.Webhooks.post] ${url} -> ${JSON.stringify(payload)}`);
      },
    },
  };

  const user = {
    telegramid: context.chatId,
    id: context.chatId,
    username: context.username,
    first_name: context.firstName,
  };

  const virtualPrint = (...args: unknown[]) => {
    const formatted = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    logs.push(`[stdout] ${formatted}`);
  };

  // 4. Transform Python-like syntax to run safely in JS sandbox
  try {
    const isJavaScript =
      /^\s*\/\//m.test(code) ||
      /\b(function|const|let|var)\b/.test(code) ||
      /=>/.test(code) ||
      /\bif\s*\(/.test(code) ||
      /;\s*$/m.test(code);

    let jsCode = code;
    if (!isJavaScript) {
      jsCode = code
        .replace(/^(\s*)#.*$/gm, '') // remove full line comments
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        .replace(/\bprint\s*\(/g, 'virtualPrint(')
        .replace(/\belif\s+/g, 'else if ')
        .replace(/f"([^"]*)"/g, '`$1`')
        .replace(/f'([^']*)'/g, '`$1`');
    }

    // Create sandbox runner
    const runner = new Function(
      'Bot',
      'User',
      'Libs',
      'user',
      'user_id',
      'ADMIN_IDS',
      'params',
      'APP_URL',
      'virtualPrint',
      'context',
      `
      "use strict";
      try {
        ${jsCode}
      } catch (err) {
        throw err;
      }
    `
    );

    runner(
      Bot,
      User,
      Libs,
      user,
      context.chatId,
      adminList,
      context.messageText.replace(/^\/\w+\s*/, ''),
      'https://telebot-creator.app',
      virtualPrint,
      context
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Runtime error during simulation: ${msg}`);
  }

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    success: errors.length === 0,
    executionTimeMs,
    messages,
    logs,
    errors,
    syntaxWarnings,
  };
}
