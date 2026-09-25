import { BotCommand } from '../types';

export const rawCommandNames: string[] = [
  '/About',
  '/Admin_Setups',
  '/Subscribe',
  '/add_channel_task',
  '/admin',
  '/adminWithdraw',
  '/adminWithdrawBnb',
  '/adminWithdrawTon',
  '/adminWithdrawXrocket',
  '/admin_deposit',
  '/buysellxx',
  '/channels_setup',
  '/ckalldata',
  '/claimRedeem',
  '/claimbonous',
  '/confirmConvert',
  '/confirmWithdraw',
  '/confirmWithdrawTon',
  '/connectionParams',
  '/createRedeem',
  '/deleteSharedCode',
  '/deposit_assets',
  '/deposit_assetsCRYPTOBOT',
  '/deposit_assetsXROCKET',
  '/deposit_manual',
  '/devloperxx',
  '/generateRedeem',
  '/getprice',
  '/handler_special_updates',
  '/helpme',
  '/join_tasks',
  '/myRedeemCodes',
  '/my_tasks',
  '/onWebhookCRYPTOBOT',
  '/onWebhookXROCKET',
  '/openConvert',
  '/openReddem',
  '/openRefer',
  '/openWithdraw',
  '/openWithdrawBnb',
  '/openWithdrawTon',
  '/openWithdrawXrocketUsdt',
  '/openwallet',
  '/quick_pay_wallet',
  '/setup_payment_gateway',
  '/start',
  '/submitWithdrawRequest',
  '/submitWithdrawRequestBnb',
  '/submitWithdrawRequestTon',
  '/submitWithdrawRequestXrocket',
  '/submit_withdraw',
  '/task_assets',
  '/transaxx',
  '/transfer',
  '/webhooksDetailsxx',
  '/withdraw_assets',
  '@',
  'Top Inviters',
  '~',
];

const getStarterCode = (cmdName: string): string => {
  if (cmdName === '/start') {
    return `# Command: /start
# Telebot Python Script
import telebot
from telebot import types

# Handler for /start user initiation
user_id = message.from_user.id
first_name = message.from_user.first_name or "User"

# Create interactive Inline Keyboard
markup = types.InlineKeyboardMarkup(row_width=2)
markup.add(
    types.InlineKeyboardButton("💼 Open Wallet", callback_data="/openwallet"),
    types.InlineKeyboardButton("👥 Referral", callback_data="/openRefer"),
    types.InlineKeyboardButton("💳 Deposit Assets", callback_data="/deposit_assets"),
    types.InlineKeyboardButton("🏧 Withdraw", callback_data="/openWithdraw"),
    types.InlineKeyboardButton("📊 Top Inviters", callback_data="Top Inviters"),
    types.InlineKeyboardButton("⚙️ Admin Setups", callback_data="/Admin_Setups")
)

welcome_msg = (
    f"👋 Welcome to *Huhgg Bot*, {first_name}!\n\n"
    f"💎 *Total Available Balance:* 0.00 USDT\n"
    f"⚡ Select an option below to proceed:"
)

bot.send_message(user_id, welcome_msg, parse_mode="Markdown", reply_markup=markup)
`;
  }

  if (cmdName === '/Admin_Setups' || cmdName === '/admin') {
    return `# Command: ${cmdName}
# Admin Control Room & System Setups Panel (Python)
import telebot
from telebot import types

user_id = str(message.from_user.id)
admin_list = ["61829103", "5478832701", "15519993"]

# Verify administrator authorization
if user_id not in admin_list:
    bot.send_message(message.chat.id, "🚫 Access Denied! You are not authorized to view Admin setups.")
else:
    markup = types.InlineKeyboardMarkup(row_width=1)
    markup.add(
        types.InlineKeyboardButton("🔧 Channels Setup", callback_data="/channels_setup"),
        types.InlineKeyboardButton("💳 Payment Gateway Setup", callback_data="/setup_payment_gateway"),
        types.InlineKeyboardButton("🎁 Generate Redeem Codes", callback_data="/generateRedeem"),
        types.InlineKeyboardButton("📊 Bot Telemetry & Stats", callback_data="/ckalldata")
    )
    
    panel_text = (
        "⚙️ *Admin System Setups Panel*\n\n"
        "• Gateway: *CryptoBot / XRocket*\n"
        "• Mini App Status: *Active (Online)*\n"
        "• Node Network: *Accelerated MTProto*\n"
        "• Role: *Authorized System Administrator*\n\n"
        "Select a configuration action below:"
    )
    bot.send_message(message.chat.id, panel_text, parse_mode="Markdown", reply_markup=markup)
`;
  }

  if (cmdName.includes('Withdraw') || cmdName.includes('withdraw')) {
    return `# Command: ${cmdName}
# Process cryptocurrency withdrawal in Python
import telebot
from telebot import types

user_id = message.from_user.id
chat_id = message.chat.id

# Parse parameters e.g. /submit_withdraw 10
args = message.text.split()[1:] if len(message.text.split()) > 1 else []
amount = float(args[0]) if args and args[0].replace('.', '', 1).isdigit() else 0.0

if amount <= 0:
    bot.send_message(chat_id, "⚠️ Please enter a valid withdrawal amount, e.g. /submit_withdraw 10", parse_mode="Markdown")
else:
    bot.send_message(
        chat_id,
        f"⏳ Submitting withdrawal request for *{amount} USDT* to blockchain network node...",
        parse_mode="Markdown"
    )
`;
  }

  if (cmdName.includes('deposit') || cmdName.includes('Deposit')) {
    return `# Command: ${cmdName}
# Handles deposit triggers and invoice generation
import telebot
from telebot import types

chat_id = message.chat.id
markup = types.InlineKeyboardMarkup(row_width=1)
markup.add(
    types.InlineKeyboardButton("🚀 Pay with CryptoBot", callback_data="/deposit_assetsCRYPTOBOT"),
    types.InlineKeyboardButton("⚡ Pay with XRocket", callback_data="/deposit_assetsXROCKET")
)

bot.send_message(
    chat_id,
    f"📥 *Deposit Assets via {cmdName}*\n\nClick below to generate your personal invoice or link your wallet address:",
    parse_mode="Markdown",
    reply_markup=markup
)
`;
  }

  if (cmdName === 'Top Inviters') {
    return `# Command: Top Inviters
# Displays leaderboard of referrals
import telebot

top_list = [
    {"rank": 1, "name": "@alex_crypto", "count": 142},
    {"rank": 2, "name": "@sam_ton", "count": 98},
    {"rank": 3, "name": "@crypto_boss", "count": 85}
]

msg = "🏆 *Top Inviters Leaderboard*\n\n"
for item in top_list:
    msg += f"{item['rank']}. {item['name']} — *{item['count']}* invites\n"

bot.send_message(message.chat.id, msg, parse_mode="Markdown")
`;
  }

  if (cmdName === '@' || cmdName === '~') {
    return `# Global message listener hook: ${cmdName}
# Intercepts messages and routes to active sub-handlers
import telebot

text = message.text or ""
if text.startswith("@"):
    bot.send_message(message.chat.id, f"⚡ Intercepted query: {text}", parse_mode="Markdown")
`;
  }

  return `# Command: ${cmdName}
# Telebot Python Script Handler
import telebot
from telebot import types

chat_id = message.chat.id
user_id = message.from_user.id
cmd_text = message.text

# Process and reply
bot.send_message(
    chat_id,
    f"🤖 Executing Python command: *{cmdName}*\\nUser ID: {user_id}",
    parse_mode="Markdown"
)
`;
};

export const defaultCommands: BotCommand[] = rawCommandNames.map((name, index) => ({
  id: `cmd-${index + 1}`,
  name,
  code: getStarterCode(name),
  isPinned: name === '/start' || name === '/Admin_Setups' || name === '/admin',
  isAdminOnly: name.toLowerCase().includes('admin') || name.includes('ckall') || name.includes('deleteSharedCode'),
  aliases: name === '/start' ? ['/help'] : name === '/Admin_Setups' ? ['/admin_menu'] : [],
  folder: name.includes('Withdraw') ? 'Finance' : name.includes('deposit') ? 'Finance' : name.includes('admin') ? 'Administration' : 'All',
  updatedAt: '5 Sep 2026',
}));
