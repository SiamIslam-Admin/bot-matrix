export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan?: string;
}

export type BotStatus = 'working' | 'stopped' | 'cloned' | 'transferred';

export interface BotCommand {
  id: string;
  name: string;
  code: string;
  isPinned?: boolean;
  isAdminOnly?: boolean;
  aliases?: string[];
  folder?: string;
  updatedAt?: string;
}

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  raw?: boolean;
}

export interface BotErrorLog {
  id: string;
  time: string;
  command: string;
  message: string;
  stack?: string;
}

export interface BotItem {
  id: string;
  botNumericId: string;
  username: string;
  name: string;
  status: BotStatus;
  activeUsers: number;
  totalCommands: number;
  category: string;
  lastActive: string;
  uptime: string;
  version: string;
  folder?: string;
  isPinned?: boolean;
  photoUrl?: string;
  webhookUrl?: string;
  token?: string;
  inRecycleBin?: boolean;
  commands?: BotCommand[];
  envVars?: EnvVariable[];
  fasterResponse?: boolean;
  autoTranslate?: boolean;
  miniAppUrl?: string;
  miniAppTitle?: string;
  errors?: BotErrorLog[];
  chats?: BotChatUser[];
}

export interface BotChatUser {
  id: string;
  telegramId: string;
  name: string;
  username: string;
  avatarColor?: string;
  photoUrl?: string;
  lastActive: string;
  lastMessage?: string;
  isBlocked: boolean;
  messagesCount?: number;
}

export interface ActivityHourData {
  time: string;
  users: number; // 0 to 3 scale as in user prompt
  commands: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export type PageTab = 
  | 'Dashboard'
  | 'My Bots'
  | 'Bot Store'
  | 'Pricing & Billing'
  | 'Broadcast Manager'
  | 'Recycle Bin'
  | 'Transfers'
  | 'Settings'
  | 'Notifications'
  | 'Help'
  | 'Support'
  | 'Admin';

export type BotStudioTab =
  | 'Intro'
  | 'Commands'
  | 'Search'
  | 'Errors'
  | 'Manage'
  | 'Chats'
  | 'Database'
  | 'Settings';

export type TelegramButtonType =
  | 'url'
  | 'callback_data'
  | 'web_app'
  | 'switch_inline_query'
  | 'switch_inline_query_current_chat'
  | 'copy_text'
  | 'request_chat';

export interface InlineButton {
  id: string;
  text: string;
  type?: TelegramButtonType;
  url?: string;
  callbackData?: string;
  webAppUrl?: string;
  switchInlineQuery?: string;
  copyText?: string;
}

export interface ActiveSessionItem {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  isCurrent: boolean;
  status: 'online' | 'offline';
  lastActive: string;
  clientType: 'desktop' | 'mobile' | 'web';
}

export interface TransferHistoryRecord {
  id: string;
  botId: string;
  botName: string;
  botNumericId: string;
  type: 'incoming' | 'outgoing';
  sender: string;
  recipient: string;
  date: string;
  relativeTime: string;
  status: 'completed' | 'pending' | 'cancelled' | 'expired';
  tokenHash: string;
  commandsCount: number;
  foldersCount: number;
}

export interface PlatformSettings {
  email: string;
  apiKey: string;
  apiKeyCreatedAt: string;
  transferConfig: 'whitelist_auto' | 'whitelist_only' | 'open' | 'disabled';
  senderWhitelist: string[];
  outgoingLimit: number; // bots per 10 minutes (max 50)
  allowBotCodeToDeleteBots: boolean;
  globalBotAdmins: string[];
  activeSessions: ActiveSessionItem[];
  emailNotifications: boolean;
  disableAnimations: boolean;
  plan: {
    name: string;
    remainingPoints: number;
    extraPoints: number;
    resetsOn: string;
    changePlanTg: string;
    billingSupportTg: string;
  };
}

export interface FailedBroadcastRecipient {
  id: string;
  telegramId: string;
  name: string;
  username?: string;
  reason: string;
  failedAt: string;
}

export interface BotBroadcastStats {
  botId: string;
  botName: string;
  botUsername: string;
  targetCount: number;
  sentCount: number;
  failedCount: number;
  status: 'Delivering' | 'Done' | 'Paused' | 'Failed';
  speed: string;
}

export interface BroadcastItem {
  id: string;
  title: string;
  targetBotIds: string[];
  targetBotUsernames: string[];
  messageType: 'Text' | 'Photo' | 'Video' | 'Audio' | 'Doc' | 'GIF' | 'Voice' | 'VidNote' | 'Sticker';
  messageText: string;
  parseMode: 'None' | 'HTML' | 'Markdown' | 'MarkdownV2';
  inlineButtons: InlineButton[];
  languageFilter?: string;
  status: 'Active' | 'Done' | 'Failed' | 'Paused';
  sentCount: number;
  totalTargetUsers: number;
  targetUserLimit?: number;
  inProgressCount?: number;
  failedCount?: number;
  failedRecipients?: FailedBroadcastRecipient[];
  cleanedFailed?: boolean;
  deliverySpeed?: string;
  botStats?: BotBroadcastStats[];
  createdAt: string;
}

export interface TransferRequest {
  id: string;
  botId: string;
  botName: string;
  botUsername: string;
  commandsCount: number;
  foldersCount: number;
  type: 'incoming' | 'outgoing';
  senderEmail?: string;
  recipientEmail?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  expiresAt: string;
}

export interface StoreBot {
  id: string;
  name: string;
  author: string;
  authorEmail: string;
  authorType?: string;
  clones: number;
  stars: number;
  version: string;
  category: string;
  tags: string[];
  shortDesc: string;
  about: string;
  keyFeatures: string[];
  isVerified?: boolean;
  price?: number;
  priceDisplay?: string;
  aiOverview: {
    summary: string;
    faqs: { question: string; answer: string }[];
  };
  similarBots?: {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    clones: number;
    stars: number;
  }[];
  botPayload: Partial<BotItem>;
}

export type PlanTier = 'free' | 'starter' | 'pro' | 'ultimate';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  price: number; // 0, 2.5, 5, 8
  badge?: string;
  description: string;
  storageLimitGB: number; // Free: 0.25, Starter: 2, Pro: 5, Ultimate: 20
  botLimit: number | 'Unlimited';
  executionLimit: number | 'Unlimited';
  features: string[];
  isPopular?: boolean;
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  invoiceId: string;
  date: string;
  planId: PlanTier;
  planName: string;
  amount: number;
  paymentMethod: 'USDT (TRC-20)' | 'USDT (TON)' | 'TON' | 'Bitcoin (BTC)' | 'Solana (SOL)' | 'Binance Pay (Crypto)' | 'Free Tier' | string;
  status: 'Success' | 'Pending' | 'Failed';
  cryptoNetwork?: string;
  depositAddress?: string;
}

export interface SubscriptionState {
  currentPlanId: PlanTier;
  status: 'Active' | 'Trial' | 'Expiring';
  billingCycle: 'Monthly' | 'Yearly';
  activatedDate: string;
  nextBillingDate: string;
  autoRenew: boolean;
  usedBots: number;
  usedExecutions: number;
  usedStorageGB: number;
}

