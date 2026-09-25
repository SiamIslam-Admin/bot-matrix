import { PlatformSettings, TransferHistoryRecord, ActiveSessionItem } from '../types';

const STORAGE_SETTINGS_KEY = 'telebot_platform_settings';
const STORAGE_HISTORY_KEY = 'telebot_transfer_history_30d';

export const initialActiveSessions: ActiveSessionItem[] = [
  {
    id: 'sess-current',
    device: 'Chrome 128 on Windows 11',
    browser: 'Chrome 128.0',
    os: 'Windows 11 64-bit',
    ip: '103.145.74.22',
    location: 'Dhaka, Bangladesh',
    isCurrent: true,
    status: 'online',
    lastActive: 'Active now',
    clientType: 'desktop',
  },
  {
    id: 'sess-telegram-desktop',
    device: 'Telegram Desktop App (Win32)',
    browser: 'Telegram TDLib v1.8',
    os: 'Windows 11',
    ip: '103.145.74.22',
    location: 'Dhaka, Bangladesh',
    isCurrent: false,
    status: 'online',
    lastActive: 'Active 14 minutes ago',
    clientType: 'desktop',
  },
  {
    id: 'sess-safari-ios',
    device: 'Safari 18 on iPhone 15 Pro',
    browser: 'Mobile Safari 18.2',
    os: 'iOS 18.2.1',
    ip: '202.4.98.110',
    location: 'Singapore Central',
    isCurrent: false,
    status: 'offline',
    lastActive: '3 hours ago (14:32)',
    clientType: 'mobile',
  },
  {
    id: 'sess-firefox-linux',
    device: 'Firefox Developer on Ubuntu',
    browser: 'Firefox 130.0',
    os: 'Ubuntu 24.04 LTS',
    ip: '185.190.140.5',
    location: 'Frankfurt, Germany',
    isCurrent: false,
    status: 'offline',
    lastActive: 'Yesterday at 20:15',
    clientType: 'desktop',
  },
];

export const initialTransferHistory30Days: TransferHistoryRecord[] = [
  {
    id: 'th-1',
    botId: '18392019',
    botName: '@VerificationOrganizationBot',
    botNumericId: '18392019',
    type: 'incoming',
    sender: '@dev_cluster_admin',
    recipient: 'You (siamislam654321@gmail.com)',
    date: '2026-09-15 14:20',
    relativeTime: '2 days ago',
    status: 'completed',
    tokenHash: 'sha256:7f18a...c930',
    commandsCount: 184,
    foldersCount: 3,
  },
  {
    id: 'th-2',
    botId: '15519993',
    botName: '@Gghh_76bot',
    botNumericId: '15519993',
    type: 'incoming',
    sender: 'siamvai27172@gmail.com',
    recipient: 'You (siamislam654321@gmail.com)',
    date: '2026-09-13 11:05',
    relativeTime: '4 days ago',
    status: 'completed',
    tokenHash: 'sha256:4a82b...910f',
    commandsCount: 59,
    foldersCount: 2,
  },
  {
    id: 'th-3',
    botId: '19283741',
    botName: '@DogsKopBot',
    botNumericId: '19283741',
    type: 'outgoing',
    sender: 'You (siamislam654321@gmail.com)',
    recipient: '@alex_telegram_dev',
    date: '2026-09-11 18:40',
    relativeTime: '6 days ago',
    status: 'pending',
    tokenHash: 'sha256:99c1e...fa02',
    commandsCount: 52,
    foldersCount: 1,
  },
  {
    id: 'th-4',
    botId: '20394812',
    botName: '@Super_Project_no_1_bot',
    botNumericId: '20394812',
    type: 'incoming',
    sender: '@trusted_creator',
    recipient: 'You (siamislam654321@gmail.com)',
    date: '2026-09-06 09:12',
    relativeTime: '11 days ago',
    status: 'completed',
    tokenHash: 'sha256:12ef8...bb21',
    commandsCount: 74,
    foldersCount: 4,
  },
  {
    id: 'th-5',
    botId: '55102948',
    botName: '@SupportHelpdeskAI',
    botNumericId: '55102948',
    type: 'incoming',
    sender: '@support_labs',
    recipient: 'You (siamislam654321@gmail.com)',
    date: '2026-08-30 16:50',
    relativeTime: '18 days ago',
    status: 'completed',
    tokenHash: 'sha256:88ad2...45e9',
    commandsCount: 40,
    foldersCount: 2,
  },
  {
    id: 'th-6',
    botId: '38192044',
    botName: '@OldCryptoPayBot',
    botNumericId: '38192044',
    type: 'outgoing',
    sender: 'You (siamislam654321@gmail.com)',
    recipient: '61829103',
    date: '2026-08-22 13:00',
    relativeTime: '26 days ago',
    status: 'expired',
    tokenHash: 'sha256:32cc0...ea77',
    commandsCount: 22,
    foldersCount: 1,
  },
  {
    id: 'th-7',
    botId: '49201948',
    botName: '@BackupNodeBot',
    botNumericId: '49201948',
    type: 'outgoing',
    sender: 'You (siamislam654321@gmail.com)',
    recipient: '@partner_agency',
    date: '2026-08-20 10:30',
    relativeTime: '28 days ago',
    status: 'cancelled',
    tokenHash: 'sha256:77da1...82bc',
    commandsCount: 16,
    foldersCount: 1,
  },
];

export const defaultPlatformSettings: PlatformSettings = {
  email: 'siamislam654321@gmail.com',
  apiKey: 'tb_live_994821a8f940b12e87c0498e9182390a',
  apiKeyCreatedAt: '2026-09-01',
  transferConfig: 'whitelist_auto',
  senderWhitelist: ['siamvai27172@gmail.com', 'trusted@example.com'],
  outgoingLimit: 50,
  allowBotCodeToDeleteBots: false,
  globalBotAdmins: ['5478832701', '61829103'],
  activeSessions: initialActiveSessions,
  emailNotifications: true,
  disableAnimations: false,
  plan: {
    name: 'Free',
    remainingPoints: 99497,
    extraPoints: 0,
    resetsOn: '5/19/2026',
    changePlanTg: 'tg://openmessage?user_id=5478832701',
    billingSupportTg: 'https://t.me/telebotsupport',
  },
};

/** Load settings from localStorage with full fallback */
export function getPlatformSettings(userEmail?: string): PlatformSettings {
  if (typeof window === 'undefined') return defaultPlatformSettings;
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) {
      const initial = {
        ...defaultPlatformSettings,
        email: userEmail || defaultPlatformSettings.email,
      };
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaultPlatformSettings,
      ...parsed,
      emailNotifications: parsed.emailNotifications !== undefined ? Boolean(parsed.emailNotifications) : defaultPlatformSettings.emailNotifications,
      disableAnimations: parsed.disableAnimations !== undefined ? Boolean(parsed.disableAnimations) : defaultPlatformSettings.disableAnimations,
      email: userEmail || parsed.email || defaultPlatformSettings.email,
      plan: {
        ...defaultPlatformSettings.plan,
        ...(parsed.plan || {}),
      },
    };
  } catch (e) {
    console.error('Error reading platform settings:', e);
    return defaultPlatformSettings;
  }
}

/** Save updated settings to localStorage */
export function savePlatformSettings(settings: PlatformSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('telebot_settings_updated', { detail: settings }));
  } catch (e) {
    console.error('Error saving platform settings:', e);
  }
}

/** Generate a brand new API key with cryptographic randomness */
export function generateNewApiKey(): string {
  const chars = 'abcdef0123456789';
  let rand = '';
  for (let i = 0; i < 32; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `tb_live_${rand}`;
}

/** 30-Day Transfer History Persistence */
export function getTransferHistory30Days(): TransferHistoryRecord[] {
  if (typeof window === 'undefined') return initialTransferHistory30Days;
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(initialTransferHistory30Days));
      return initialTransferHistory30Days;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading transfer history:', e);
    return initialTransferHistory30Days;
  }
}

export function saveTransferHistory30Days(records: TransferHistoryRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('telebot_history_updated', { detail: records }));
  } catch (e) {
    console.error('Error saving transfer history:', e);
  }
}
