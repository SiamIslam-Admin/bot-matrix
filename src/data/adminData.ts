export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'vip' | 'user';
  status: 'active' | 'blocked' | 'banned';
  plan: 'Free' | 'Pro' | 'VIP Enterprise';
  botsCount: number;
  botsLimit: number;
  storageMb: number;
  storageQuotaMb: number;
  cpuUsagePercent: number;
  lastIp: string;
  registeredAt: string;
  banReason?: string;
}

export interface PlatformPlanConfig {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  priceUsdtMonthly: number;
  priceUsdtYearly: number;
  botLimit: number;
  storageLimitGB: number;
  executionsLimit: string | number;
  priorityWorker: boolean;
  customWebhook: boolean;
  badge: string;
  activeSubscribersCount: number;
}

export interface AdminBroadcastMessage {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'active_only' | 'pro_enterprise' | 'free_only';
  priority: 'normal' | 'urgent' | 'maintenance' | 'critical';
  sentAt: string;
  targetBotsCount: number;
  reachedUsersEst: number;
  delivered: boolean;
  actionButtonLabel?: string;
  actionButtonUrl?: string;
}

export interface AdminBotResource {
  id: string;
  name: string;
  username: string;
  ownerEmail: string;
  ownerName: string;
  status: 'working' | 'stopped' | 'throttled' | 'quarantined';
  cpuPercent: number;
  ramMb: number;
  storageMb: number;
  requestsPerSec: number;
  activeUsers: number;
  totalCommands: number;
  uptime: string;
  isThrottled: boolean;
  category: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  action: string;
  actorEmail: string;
  target: string;
  severity: 'info' | 'warning' | 'danger';
  details: string;
}

export interface ServerClusterStats {
  cpuUsagePercent: number;
  cpuCores: number;
  ramUsedGb: number;
  ramTotalGb: number;
  diskUsedGb: number;
  diskTotalGb: number;
  bandwidthInMbps: number;
  bandwidthOutMbps: number;
  activeWorkers: number;
  totalWorkers: number;
  totalRequestsPerMin: number;
  totalBotsOnline: number;
  totalUsersCount: number;
  serverUptime: string;
  postgresConnections: number;
  redisMemoryMb: number;
}

export const initialServerStats: ServerClusterStats = {
  cpuUsagePercent: 37.4,
  cpuCores: 8,
  ramUsedGb: 6.2,
  ramTotalGb: 16.0,
  diskUsedGb: 148.6,
  diskTotalGb: 500.0,
  bandwidthInMbps: 24.5,
  bandwidthOutMbps: 58.2,
  activeWorkers: 32,
  totalWorkers: 32,
  totalRequestsPerMin: 18450,
  totalBotsOnline: 142,
  totalUsersCount: 524,
  serverUptime: '99.98% (48 days, 14 hours)',
  postgresConnections: 42,
  redisMemoryMb: 384,
};

export const initialAdminUsers: AdminUser[] = [
  {
    id: 'usr-101',
    name: 'Siam Islam (You)',
    email: 'siamislam654321@gmail.com',
    role: 'admin',
    status: 'active',
    plan: 'VIP Enterprise',
    botsCount: 14,
    botsLimit: 50,
    storageMb: 124.5,
    storageQuotaMb: 1024,
    cpuUsagePercent: 12.4,
    lastIp: '103.145.72.19',
    registeredAt: '2026-01-10',
  },
  {
    id: 'usr-102',
    name: 'Alex Vance',
    email: 'alex.vance@telebot.dev',
    role: 'vip',
    status: 'active',
    plan: 'Pro',
    botsCount: 8,
    botsLimit: 15,
    storageMb: 89.2,
    storageQuotaMb: 512,
    cpuUsagePercent: 9.8,
    lastIp: '185.220.101.5',
    registeredAt: '2026-02-14',
  },
  {
    id: 'usr-103',
    name: 'CryptoWhale Master',
    email: 'whale.trader@tonhold.io',
    role: 'vip',
    status: 'active',
    plan: 'VIP Enterprise',
    botsCount: 19,
    botsLimit: 50,
    storageMb: 245.8,
    storageQuotaMb: 512,
    cpuUsagePercent: 28.5,
    lastIp: '45.134.22.88',
    registeredAt: '2026-02-28',
  },
  {
    id: 'usr-104',
    name: 'Spammy Bot Farm',
    email: 'unknown_botnet@tempmail.ninja',
    role: 'user',
    status: 'banned',
    plan: 'Free',
    botsCount: 34,
    botsLimit: 2,
    storageMb: 380.0,
    storageQuotaMb: 100,
    cpuUsagePercent: 45.2,
    lastIp: '194.26.29.112',
    registeredAt: '2026-03-01',
    banReason: 'Automated mass token scraping & Telegram TOS flood violation',
  },
  {
    id: 'usr-105',
    name: 'Elena Rostova',
    email: 'elena.rostova@gmail.com',
    role: 'user',
    status: 'blocked',
    plan: 'Free',
    botsCount: 3,
    botsLimit: 5,
    storageMb: 34.1,
    storageQuotaMb: 100,
    cpuUsagePercent: 2.1,
    lastIp: '91.214.12.4',
    registeredAt: '2026-03-05',
    banReason: 'Temporarily blocked due to pending identity verification',
  },
  {
    id: 'usr-106',
    name: 'Devon Miles',
    email: 'devon.miles@cybertech.org',
    role: 'user',
    status: 'active',
    plan: 'Pro',
    botsCount: 5,
    botsLimit: 15,
    storageMb: 52.4,
    storageQuotaMb: 200,
    cpuUsagePercent: 4.6,
    lastIp: '172.56.21.90',
    registeredAt: '2026-03-12',
  },
];

export const initialPlatformPlans: PlatformPlanConfig[] = [
  {
    id: 'free',
    name: 'Free Tier Cluster',
    priceUsdtMonthly: 0,
    priceUsdtYearly: 0,
    botLimit: 2,
    storageLimitGB: 1,
    executionsLimit: '10,000 / mo',
    priorityWorker: false,
    customWebhook: false,
    badge: 'Starter',
    activeSubscribersCount: 412,
  },
  {
    id: 'pro',
    name: 'Pro Bot Node',
    priceUsdtMonthly: 9.99,
    priceUsdtYearly: 95.88,
    botLimit: 15,
    storageLimitGB: 10,
    executionsLimit: '500,000 / mo',
    priorityWorker: true,
    customWebhook: true,
    badge: 'Popular',
    activeSubscribersCount: 88,
  },
  {
    id: 'enterprise',
    name: 'VIP Enterprise Cluster',
    priceUsdtMonthly: 29.99,
    priceUsdtYearly: 287.88,
    botLimit: 50,
    storageLimitGB: 50,
    executionsLimit: 'Unlimited',
    priorityWorker: true,
    customWebhook: true,
    badge: 'High Performance',
    activeSubscribersCount: 24,
  },
];

export const initialAdminBroadcasts: AdminBroadcastMessage[] = [
  {
    id: 'bc-1',
    title: 'Cluster Maintenance & Singapore Node Optimization',
    content: 'Scheduled zero-downtime maintenance on Worker Node 9 completed. Telegram webhook latency reduced to under 12ms.',
    targetAudience: 'all',
    priority: 'maintenance',
    sentAt: 'Yesterday, 18:30 UTC',
    targetBotsCount: 142,
    reachedUsersEst: 48920,
    delivered: true,
    actionButtonLabel: 'View Node Status',
    actionButtonUrl: 'https://status.telebotcreator.io',
  },
  {
    id: 'bc-2',
    title: 'New AI Studio & TON Payment Engine Live',
    content: 'All bots now support instant TON wallet connection and Gemini Flash inline completions without extra setup.',
    targetAudience: 'pro_enterprise',
    priority: 'normal',
    sentAt: '3 days ago',
    targetBotsCount: 112,
    reachedUsersEst: 39100,
    delivered: true,
    actionButtonLabel: 'Learn More',
    actionButtonUrl: 'https://docs.telebotcreator.io/ton',
  },
];

export const initialAdminBots: AdminBotResource[] = [
  {
    id: 'bot-res-1',
    name: 'Telegram AI Assistant Pro',
    username: '@tg_ai_supermind_bot',
    ownerEmail: 'siamislam654321@gmail.com',
    ownerName: 'Siam Islam',
    status: 'working',
    cpuPercent: 14.8,
    ramMb: 680,
    storageMb: 85.4,
    requestsPerSec: 42.1,
    activeUsers: 3420,
    totalCommands: 18,
    uptime: '99.95%',
    isThrottled: false,
    category: 'AI & Chatbots',
  },
  {
    id: 'bot-res-2',
    name: 'Crypto Price Alert Radar',
    username: '@cryptoprice_live_radar_bot',
    ownerEmail: 'whale.trader@tonhold.io',
    ownerName: 'CryptoWhale Master',
    status: 'working',
    cpuPercent: 22.4,
    ramMb: 940,
    storageMb: 142.0,
    requestsPerSec: 78.6,
    activeUsers: 1105,
    totalCommands: 12,
    uptime: '100%',
    isThrottled: false,
    category: 'Finance & Crypto',
  },
  {
    id: 'bot-res-3',
    name: 'Mass Scraper Node 09',
    username: '@unauthorized_scraper_bot',
    ownerEmail: 'unknown_botnet@tempmail.ninja',
    ownerName: 'Spammy Bot Farm',
    status: 'quarantined',
    cpuPercent: 38.2,
    ramMb: 1240,
    storageMb: 290.5,
    requestsPerSec: 145.0,
    activeUsers: 84,
    totalCommands: 64,
    uptime: '42.10%',
    isThrottled: true,
    category: 'Utility & Tools',
  },
  {
    id: 'bot-res-4',
    name: 'Group Shield & Anti-Spam',
    username: '@groupshield_pro_bot',
    ownerEmail: 'alex.vance@telebot.dev',
    ownerName: 'Alex Vance',
    status: 'working',
    cpuPercent: 8.5,
    ramMb: 420,
    storageMb: 64.2,
    requestsPerSec: 31.4,
    activeUsers: 2120,
    totalCommands: 16,
    uptime: '99.99%',
    isThrottled: false,
    category: 'Security & Moderation',
  },
  {
    id: 'bot-res-5',
    name: 'Camera Awareness Demo',
    username: '@camera_security_lab_bot',
    ownerEmail: 'devon.miles@cybertech.org',
    ownerName: 'Devon Miles',
    status: 'working',
    cpuPercent: 4.1,
    ramMb: 280,
    storageMb: 42.1,
    requestsPerSec: 12.0,
    activeUsers: 1489,
    totalCommands: 10,
    uptime: '99.80%',
    isThrottled: false,
    category: 'Utilities',
  },
  {
    id: 'bot-res-6',
    name: 'Casino Roll & Dice Bot',
    username: '@roll_ton_dice_bot',
    ownerEmail: 'whale.trader@tonhold.io',
    ownerName: 'CryptoWhale Master',
    status: 'working',
    cpuPercent: 11.2,
    ramMb: 510,
    storageMb: 58.7,
    requestsPerSec: 28.3,
    activeUsers: 840,
    totalCommands: 22,
    uptime: '99.70%',
    isThrottled: false,
    category: 'Gaming',
  },
];

export const initialAdminAuditLogs: AdminAuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2 mins ago',
    action: 'BOT_QUARANTINED',
    actorEmail: 'system.daemon@cluster',
    target: '@unauthorized_scraper_bot',
    severity: 'danger',
    details: 'Exceeded webhook CPU threshold (38% cluster load). Process throttled automatically.',
  },
  {
    id: 'log-2',
    timestamp: '14 mins ago',
    action: 'USER_BANNED',
    actorEmail: 'siamislam654321@gmail.com',
    target: 'unknown_botnet@tempmail.ninja',
    severity: 'warning',
    details: 'Account banned due to Telegram flood TOS and socket abuse.',
  },
  {
    id: 'log-3',
    timestamp: '42 mins ago',
    action: 'DISK_CLEANUP',
    actorEmail: 'system.daemon@cluster',
    target: '/var/lib/telebot/cache',
    severity: 'info',
    details: 'Postgres VACUUM completed. Reclaimed 14.2 GB of temporary media storage.',
  },
  {
    id: 'log-4',
    timestamp: '1 hour ago',
    action: 'ROLE_UPGRADED',
    actorEmail: 'siamislam654321@gmail.com',
    target: 'alex.vance@telebot.dev',
    severity: 'info',
    details: 'Upgraded user tier to VIP Partner with 512 MB NVMe disk quota.',
  },
  {
    id: 'log-5',
    timestamp: '3 hours ago',
    action: 'CLUSTER_HEALTH_CHECK',
    actorEmail: 'system.daemon@cluster',
    target: 'All 32 Worker Nodes',
    severity: 'info',
    details: 'Routine integrity check verified. Latency: 22ms. Zero dropped webhooks.',
  },
];
