/**
 * Telebot Creator API Autocomplete & Snippet Provider for Ace Editor
 */

export interface TelebotCompletionItem {
  caption: string;
  value: string;
  snippet?: string;
  score: number;
  meta: string;
  docHTML?: string;
}

export const TELEBOT_COMPLETIONS: TelebotCompletionItem[] = [
  // Core Bot Methods
  {
    caption: 'Bot.sendMessage',
    value: 'Bot.sendMessage(chat_id, "Hello")',
    snippet: 'Bot.sendMessage(${1:user_id}, "${2:Your message here}")',
    score: 1000,
    meta: 'Telebot API',
    docHTML: '<b>Bot.sendMessage(chat_id, text)</b><br/>Sends a text message to a user or group.',
  },
  {
    caption: 'Bot.sendInlineKeyboard',
    value: 'Bot.sendInlineKeyboard',
    snippet:
      'keyboard = [\n    [{"text": "${1:Button 1}", "callback_data": "${2:cmd_1}"}],\n    [{"text": "${3:Button 2}", "callback_data": "${4:cmd_2}"}]\n]\nBot.sendInlineKeyboard(${5:user_id}, "${6:Select an option:}", keyboard)',
    score: 990,
    meta: 'Telebot API',
    docHTML: '<b>Bot.sendInlineKeyboard(chat_id, text, buttons)</b><br/>Sends interactive clickable buttons.',
  },
  {
    caption: 'Bot.getChatId',
    value: 'Bot.getChatId()',
    snippet: 'user_id = Bot.getChatId()',
    score: 980,
    meta: 'Telebot API',
    docHTML: '<b>Bot.getChatId()</b><br/>Returns current Telegram user or chat numeric ID.',
  },
  {
    caption: 'Bot.getMessageText',
    value: 'Bot.getMessageText()',
    snippet: 'msg_text = Bot.getMessageText()',
    score: 970,
    meta: 'Telebot API',
    docHTML: '<b>Bot.getMessageText()</b><br/>Returns text string of current incoming message.',
  },
  {
    caption: 'Bot.getUser',
    value: 'Bot.getUser()',
    snippet: 'user = Bot.getUser()',
    score: 960,
    meta: 'Telebot API',
    docHTML: '<b>Bot.getUser()</b><br/>Returns user object with id, username, first_name.',
  },
  {
    caption: 'Bot.getUsername',
    value: 'Bot.getUsername()',
    snippet: 'username = Bot.getUsername()',
    score: 950,
    meta: 'Telebot API',
    docHTML: '<b>Bot.getUsername()</b><br/>Returns Telegram username of sender.',
  },
  {
    caption: 'Bot.isAdmin',
    value: 'Bot.isAdmin()',
    snippet: 'if not Bot.isAdmin():\n    Bot.sendMessage(Bot.getChatId(), "⛔ Access Denied. Admin only!")\n    return',
    score: 940,
    meta: 'Telebot API',
    docHTML: '<b>Bot.isAdmin()</b><br/>Checks if current user is bot administrator.',
  },
  {
    caption: 'Bot.setUserProp',
    value: 'Bot.setUserProp',
    snippet: 'Bot.setUserProp(${1:user_id}, "${2:key}", ${3:value})',
    score: 930,
    meta: 'Storage',
    docHTML: '<b>Bot.setUserProp(user_id, key, value)</b><br/>Stores persistent value for a specific user.',
  },
  {
    caption: 'Bot.getUserProp',
    value: 'Bot.getUserProp',
    snippet: 'val = Bot.getUserProp(${1:user_id}, "${2:key}", ${3:0})',
    score: 920,
    meta: 'Storage',
    docHTML: '<b>Bot.getUserProp(user_id, key, default)</b><br/>Retrieves persistent value for a user.',
  },
  {
    caption: 'Bot.setProp',
    value: 'Bot.setProp',
    snippet: 'Bot.setProp("${1:key}", ${2:value})',
    score: 910,
    meta: 'Storage',
    docHTML: '<b>Bot.setProp(key, value)</b><br/>Stores global bot-wide property.',
  },
  {
    caption: 'Bot.getProp',
    value: 'Bot.getProp',
    snippet: 'val = Bot.getProp("${1:key}", ${2:None})',
    score: 900,
    meta: 'Storage',
    docHTML: '<b>Bot.getProp(key, default)</b><br/>Retrieves global bot-wide property.',
  },
  {
    caption: 'Bot.runCommand',
    value: 'Bot.runCommand',
    snippet: 'Bot.runCommand("${1:/menu}")',
    score: 890,
    meta: 'Telebot API',
    docHTML: '<b>Bot.runCommand(command_name)</b><br/>Executes another bot command.',
  },
  {
    caption: 'Bot.sendPhoto',
    value: 'Bot.sendPhoto',
    snippet: 'Bot.sendPhoto(${1:user_id}, "${2:https://example.com/photo.jpg}", "${3:Caption text}")',
    score: 880,
    meta: 'Telebot API',
    docHTML: '<b>Bot.sendPhoto(chat_id, photo_url, caption)</b><br/>Sends a photo.',
  },
  {
    caption: 'Bot.editMessage',
    value: 'Bot.editMessage',
    snippet: 'Bot.editMessage(${1:user_id}, ${2:message_id}, "${3:Updated text}")',
    score: 870,
    meta: 'Telebot API',
    docHTML: '<b>Bot.editMessage(chat_id, message_id, text)</b><br/>Updates previously sent message.',
  },
  {
    caption: 'Bot.deleteMessage',
    value: 'Bot.deleteMessage',
    snippet: 'Bot.deleteMessage(${1:user_id}, ${2:message_id})',
    score: 860,
    meta: 'Telebot API',
    docHTML: '<b>Bot.deleteMessage(chat_id, message_id)</b><br/>Deletes message from chat.',
  },
  {
    caption: 'Bot.inspect',
    value: 'Bot.inspect(data)',
    snippet: 'Bot.inspect(${1:variable})',
    score: 850,
    meta: 'Debugging',
    docHTML: '<b>Bot.inspect(data)</b><br/>Logs variable structure for debugging.',
  },
];

export interface MagicSnippetTemplate {
  id: string;
  title: string;
  description: string;
  iconName: string;
  code: string;
}

export const MAGIC_SNIPPETS: MagicSnippetTemplate[] = [
  {
    id: 'send_inline_keyboard',
    title: 'Interactive Buttons (Inline Keyboard)',
    description: 'Send clickable callback buttons with icons',
    iconName: 'LayoutGrid',
    code: `# Interactive Inline Keyboard Template
user_id = Bot.getChatId()

buttons = [
    [{"text": "💰 Check Balance", "callback_data": "/balance"}],
    [{"text": "🎁 Daily Bonus", "callback_data": "/bonus"}, {"text": "📊 Stats", "callback_data": "/stats"}],
    [{"text": "⚙️ Settings", "callback_data": "/settings"}]
]

Bot.sendInlineKeyboard(user_id, "✨ *Choose an option from the menu:*", buttons)
`,
  },
  {
    id: 'admin_only_guard',
    title: 'Admin-Only Security Guard',
    description: 'Block unauthorized users from running this command',
    iconName: 'ShieldAlert',
    code: `# Admin-Only Access Guard
user_id = Bot.getChatId()

if not Bot.isAdmin():
    Bot.sendMessage(user_id, "⛔ *Access Denied!*\\nThis command is restricted to bot administrators.")
    return

# Place your admin code below
Bot.sendMessage(user_id, "🔓 *Welcome Admin!* Execution started...")
`,
  },
  {
    id: 'user_balance_system',
    title: 'User Balance / Points System',
    description: 'Load user balance, add points, and save persistently',
    iconName: 'Coins',
    code: `# User Balance & Points System
user_id = Bot.getChatId()

# Load current balance (default: 0)
balance = Bot.getUserProp(user_id, "balance", 0)

# Add 10 points
balance += 10
Bot.setUserProp(user_id, "balance", balance)

Bot.sendMessage(user_id, f"🎉 *Points Updated!*\\nYour current balance: *{balance} coins*")
`,
  },
  {
    id: 'daily_reward_claim',
    title: '24-Hour Daily Reward Claim',
    description: 'Allow users to claim rewards only once per day',
    iconName: 'Gift',
    code: `import time

user_id = Bot.getChatId()
current_time = int(time.time())
last_claimed = Bot.getUserProp(user_id, "last_reward_time", 0)

COOLDOWN_SECONDS = 86400  # 24 hours

if (current_time - last_claimed) < COOLDOWN_SECONDS:
    remaining_hours = int((COOLDOWN_SECONDS - (current_time - last_claimed)) / 3600)
    Bot.sendMessage(user_id, f"⏳ *Come back later!*\\nYou already claimed your reward. Wait *{remaining_hours} hours*.")
    return

# Grant reward
Bot.setUserProp(user_id, "last_reward_time", current_time)
bal = Bot.getUserProp(user_id, "balance", 0) + 50
Bot.setUserProp(user_id, "balance", bal)

Bot.sendMessage(user_id, f"🎁 *Daily Bonus Claimed!*\\nYou received *+50 coins*! Current balance: *{bal}*")
`,
  },
  {
    id: 'quick_clean_header',
    title: 'Standard Command Documentation Header',
    description: 'Add clean documentation header to top of file',
    iconName: 'FileText',
    code: `# ============================================================
# Telebot Creator Command Script
# Author: siamislam
# Language: Python 3 / TPY Engine
# ============================================================

user_id = Bot.getChatId()
command_text = Bot.getMessageText()

`,
  },
];
