import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Initial seed data structures
const defaultCommands = [
  { id: 'cmd-1', name: '/start', code: "import telebot\n\n@bot.message_handler(commands=['start'])\ndef send_welcome(message):\n    bot.reply_to(message, 'Hello! Welcome to BOT MATRIX cluster.')\n", language: 'python' as const, isCustom: false, isModified: false, isPinned: true },
  { id: 'cmd-2', name: '/help', code: "import telebot\n\n@bot.message_handler(commands=['help'])\ndef send_help(message):\n    bot.reply_to(message, 'Here is how you can use this bot.\\n/start - Initiate\\n/settings - Options')\n", language: 'python' as const, isCustom: false, isModified: false },
  { id: 'cmd-3', name: '/settings', code: "import telebot\n\n@bot.message_handler(commands=['settings'])\ndef send_settings(message):\n    bot.reply_to(message, 'Configure notifications and cluster settings.')\n", language: 'python' as const, isCustom: false, isModified: false },
  { id: 'cmd-4', name: '/status', code: "import telebot\n\n@bot.message_handler(commands=['status'])\ndef send_status(message):\n    bot.reply_to(message, 'Cluster node online • Uptime 99.98%')\n", language: 'python' as const, isCustom: false, isModified: false },
];

let botsDatabase: any[] = [
  {
    id: '15519993',
    botNumericId: '15519993',
    username: '@Gghh_76bot',
    name: 'Huhgg',
    status: 'stopped',
    activeUsers: 0,
    totalCommands: 59,
    category: 'Operations',
    folder: 'Main Bots',
    isPinned: true,
    lastActive: '5 Sep 2026',
    uptime: '00:00:00',
    version: 'v1.0.0',
    webhookUrl: 'https://api.telebotcreator.io/v1/webhook/15519993',
    token: '729104829:BBRj_pLOe902...',
    commands: defaultCommands,
    envVars: [
      { id: 'env-1', key: 'APP_URL', value: 'https://telebot-creator.app', raw: false },
      { id: 'env-2', key: 'ADMIN_IDS', value: '["61829103", "15519993"]', raw: true },
      { id: 'env-3', key: 'PAYMENT_GATEWAY', value: 'CryptoBot', raw: false },
    ],
    fasterResponse: true,
    autoTranslate: false,
    miniAppTitle: 'Huhgg Portal Mini App',
    miniAppUrl: 'https://huhgg-telegram.app',
    errors: [],
  },
  {
    id: '18392019',
    botNumericId: '18392019',
    username: '@VerificationOrganizationBot',
    name: 'Verification Org Bot',
    status: 'working',
    activeUsers: 6,
    totalCommands: 184,
    category: 'Security & Auth',
    folder: 'Main Bots',
    isPinned: true,
    lastActive: 'Just now',
    uptime: '99.99%',
    version: 'v1.2.4',
    webhookUrl: 'https://api.telebotcreator.io/v1/webhook/18392019',
    token: '719283749:AAHq_mXZe881...',
    commands: defaultCommands,
    envVars: [
      { id: 'env-1', key: 'AUTH_SECRET', value: 'sec_9918239a0', raw: false },
    ],
    fasterResponse: true,
    autoTranslate: true,
  },
  {
    id: '19283741',
    botNumericId: '19283741',
    username: '@TelegramAutoSupportBot',
    name: 'Support Agent Bot',
    status: 'working',
    activeUsers: 142,
    totalCommands: 42,
    category: 'Customer Support',
    folder: 'Operations',
    isPinned: false,
    lastActive: '2 mins ago',
    uptime: '99.85%',
    version: 'v2.1.0',
    webhookUrl: 'https://api.telebotcreator.io/v1/webhook/19283741',
    token: '891029381:BBQk_lMNe349...',
    commands: defaultCommands,
    envVars: [],
    fasterResponse: true,
  },
  {
    id: '20491823',
    botNumericId: '20491823',
    username: '@CryptoSignalAlertsBot',
    name: 'Crypto Signal Alerts',
    status: 'working',
    activeUsers: 890,
    totalCommands: 75,
    category: 'Finance & Crypto',
    folder: 'Earning & Crypto',
    isPinned: false,
    lastActive: '1 min ago',
    uptime: '100%',
    version: 'v3.0.1',
    webhookUrl: 'https://api.telebotcreator.io/v1/webhook/20491823',
    token: '901827364:CCPt_zKMe412...',
    commands: defaultCommands,
    envVars: [],
    fasterResponse: true,
  },
];

let storeBotsDatabase: any[] = [
  {
    id: 'store-1',
    name: 'GPT-4o Omnichannel AI Assistant',
    author: 'TelegramAI Labs',
    category: 'AI & Chatbots',
    stars: 5,
    clones: 14200,
    shortDesc: 'State-of-the-art conversational AI with contextual chat memory and multi-language comprehension.',
    about: 'GPT-4o Omnichannel Assistant integrates next-generation LLM intelligence into Telegram. Features streaming replies, conversation memory, file synthesis, and auto-translation.',
    tags: ['AI', 'OpenAI', 'SmartBot', 'Multi-Language', 'Conversational'],
    version: 'v3.2.0',
    isVerified: true,
    keyFeatures: ['Full conversational memory', 'Markdown formatting', 'Multi-lingual automatic translation', 'Rate limiter protect'],
    botPayload: {
      username: '@gpt4o_official_bot',
      uptime: '99.99%',
      commands: defaultCommands,
    },
  },
  {
    id: 'store-2',
    name: 'Crypto Whale & DEX Tracker',
    author: 'SatoshiNode Labs',
    category: 'Finance & Crypto',
    stars: 5,
    clones: 9850,
    shortDesc: 'Real-time on-chain DEX alert bot monitoring Solana, Ethereum, and TON whale transactions.',
    about: 'Instantly get notified when large wallet movements happen across decentralized exchanges. Configurable thresholds and Telegram chart generation.',
    tags: ['Crypto', 'Solana', 'Ethereum', 'TON', 'WhaleAlert'],
    version: 'v2.8.4',
    isVerified: true,
    keyFeatures: ['Real-time RPC tracking', 'Interactive candlestick charts', 'Customizable threshold notifications', 'Multi-chain support'],
    botPayload: {
      username: '@dex_whale_watcher_bot',
      uptime: '99.95%',
      commands: defaultCommands,
    },
  },
  {
    id: 'store-3',
    name: 'Telegram Group Guardian Shield',
    author: 'Security Matrix Devs',
    category: 'Security',
    stars: 4,
    clones: 22100,
    shortDesc: 'Automated Telegram anti-spam, CAPTCHA entrance gatekeeper, and phishing URL blocker.',
    about: 'Protect your groups from spam bots, raid attacks, and crypto scammers. Features interactive button CAPTCHA verification for newcomers and automatic link sanitization.',
    tags: ['Security', 'AntiSpam', 'Captcha', 'AdminTool', 'Guardian'],
    version: 'v4.1.2',
    isVerified: true,
    keyFeatures: ['Interactive button CAPTCHA', 'Phishing link scanner', 'Auto-kick mass spam bots', 'Admin audit logs'],
    botPayload: {
      username: '@group_guardian_shield_bot',
      uptime: '100%',
      commands: defaultCommands,
    },
  },
  {
    id: 'store-4',
    name: 'Smart Broadcast & Newsletter Node',
    author: 'Cluster Stream Systems',
    category: 'Utilities',
    stars: 5,
    clones: 11400,
    shortDesc: 'High-speed broadcast delivery engine capable of dispatching 50,000+ messages per hour.',
    about: 'Dispatch targeted announcements, promotional campaigns, and updates with inline interactive buttons, user language filtering, and detailed open-rate telemetry.',
    tags: ['Broadcast', 'Newsletter', 'Marketing', 'HighSpeed', 'Campaigns'],
    version: 'v2.5.0',
    isVerified: true,
    keyFeatures: ['Inline button designer', 'Automatic retry engine', 'Scheduled deliveries', 'Recipient tag filtering'],
    botPayload: {
      username: '@smart_broadcast_node_bot',
      uptime: '99.98%',
      commands: defaultCommands,
    },
  },
  {
    id: 'store-5',
    name: 'Security Probe & Awareness Bot',
    author: 'RedTeam Security',
    category: 'Security',
    stars: 4,
    clones: 6200,
    shortDesc: 'Educational cybersecurity probe bot demonstrating authorization tokens, telemetry logging, and security best practices.',
    about: 'Designed for enterprise security training and red-team audits. Demonstrates how authentication tokens and webhook payloads can be audited and safeguarded.',
    tags: ['Security', 'Auditing', 'Enterprise', 'Diagnostics', 'SafeNode'],
    version: 'v1.4.0',
    isVerified: true,
    keyFeatures: ['Token security verification', 'Encrypted telemetry logs', 'Diagnostic reports', 'Audit trail certification'],
    botPayload: {
      username: '@security_probe_audit_bot',
      uptime: '99.90%',
      commands: defaultCommands,
    },
  },
  {
    id: 'store-6',
    name: 'Telegram Store & Digital Checkout',
    author: 'E-Comm Flow',
    category: 'Finance & Crypto',
    stars: 5,
    clones: 8750,
    shortDesc: 'Turn any Telegram bot into an automated storefront accepting Telegram Stars and USDT.',
    about: 'Full e-commerce shopping cart inside Telegram with instant digital fulfillment, license key delivery, and automated receipt generation.',
    tags: ['Store', 'ECommerce', 'DigitalGoods', 'TelegramStars', 'USDT'],
    version: 'v3.0.0',
    isVerified: true,
    keyFeatures: ['Telegram Stars native checkout', 'USDT automated escrow', 'Digital product instant delivery', 'Customer invoice management'],
    botPayload: {
      username: '@telegram_store_checkout_bot',
      uptime: '99.99%',
      commands: defaultCommands,
    },
  },
];

let broadcastsDatabase: any[] = [
  {
    id: 'bc-1',
    title: 'Platform Maintenance Notice & Upgrade',
    targetBotIds: ['18392019', '19283741'],
    targetBotUsernames: ['@VerificationOrganizationBot', '@TelegramAutoSupportBot'],
    messageType: 'Text',
    messageText: '🚀 BOT MATRIX cluster has been upgraded to Node 22 with ultra-low latency response times.',
    parseMode: 'HTML',
    inlineButtons: [{ id: 'btn-1', text: 'View Release Notes', url: 'https://t.me/BotMatrixOfficial' }],
    status: 'Done',
    sentCount: 148,
    totalTargetUsers: 148,
    failedCount: 0,
    failedRecipients: [],
    deliverySpeed: '120 msg/sec',
    createdAt: 'Today, 10:30 AM',
  },
];

let notificationsDatabase: any[] = [
  {
    id: 'notif-1',
    title: 'Bot Node Deployed',
    message: 'Verification Org Bot is running smoothly on Cluster-Node-07.',
    time: '5 mins ago',
    read: false,
    type: 'success',
  },
  {
    id: 'notif-2',
    title: 'Webhook Synchronized',
    message: 'Automated Telegram webhook endpoints verified with 0 error rate.',
    time: '1 hour ago',
    read: false,
    type: 'info',
  },
  {
    id: 'notif-3',
    title: 'Security Audit Certificate',
    message: 'Cryptographic SHA-256 certificate renewed for your bot fleet.',
    time: 'Yesterday',
    read: true,
    type: 'security',
  },
];

let platformSettingsDatabase: any = {
  email: 'admin@botmatrix.cluster',
  apiKey: 'bmx_live_98a72b14c3e809f12d887a0',
  apiKeyCreatedAt: '2026-09-01',
  transferConfig: 'whitelist_auto',
  senderWhitelist: ['@BotMatrixAdmin', '@VerifiedDeployer'],
  outgoingLimit: 25,
  allowBotCodeToDeleteBots: false,
  globalBotAdmins: ['18392019', '61829103'],
  activeSessions: [
    {
      id: 'sess-current',
      device: 'Primary Workstation',
      browser: 'Chrome 128 / macOS',
      os: 'macOS Sonoma',
      ip: '198.51.100.24',
      location: 'Frankfurt, DE (Encrypted Edge)',
      isCurrent: true,
      status: 'online',
      lastActive: 'Active Now',
      clientType: 'desktop',
    },
  ],
  emailNotifications: true,
  pushNotifications: true,
  rememberMe: true,
  disableAnimations: false,
  plan: {
    name: 'Enterprise Cluster Pro',
    remainingPoints: 9850,
    extraPoints: 2000,
    resetsOn: 'Oct 01, 2026',
    changePlanTg: 'https://t.me/BotMatrixSupportBot',
    billingSupportTg: 'https://t.me/BotMatrixSupportBot',
  },
};

let audienceDatabase: Record<string, any[]> = {};

function getAudienceForBot(botId: string): any[] {
  if (audienceDatabase[botId]) return audienceDatabase[botId];

  const pool: any[] = [];
  const firstNames = ['Alex', 'Sarah', 'Dmitry', 'Viktor', 'Elena', 'Chen', 'Michael', 'Fatima', 'Liam', 'Zack', 'David', 'Maya', 'Lucas', 'Emma', 'Tariq', 'Sofia', 'Marcus', 'Oliver', 'Chloe', 'Daniel'];
  const sampleMessages = [
    'How do I upgrade to the VIP cluster plan?',
    'Awesome bot service! Response time is under 100ms.',
    '/start',
    '/help',
    'Can I transfer ownership of this bot?',
    'Webhook received successfully.',
    'Test ping command executed.',
    'Please add support for custom payment webhooks.',
  ];

  for (let i = 1; i <= 60; i++) {
    const isBlocked = i % 11 === 0;
    const name = firstNames[i % firstNames.length] + ' ' + (String.fromCharCode(65 + (i % 26))) + '.';
    pool.push({
      id: `usr-${botId}-${i}`,
      telegramId: (72019280 + i * 47).toString(),
      name,
      username: `@user_${(72019280 + i * 47).toString().slice(-4)}`,
      lastActive: i % 3 === 0 ? `Today, ${(10 + (i % 12)).toString().padStart(2, '0')}:${((i * 7) % 59).toString().padStart(2, '0')}` : `${(i % 7) + 1} Sep, 14:20`,
      lastMessage: isBlocked ? 'Spam promotional URL flagged by security' : sampleMessages[i % sampleMessages.length],
      isBlocked,
      messagesCount: (i * 3) % 45 + 1,
    });
  }

  audienceDatabase[botId] = pool;
  return pool;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // -----------------------------------------------------------
  // API ROUTES (Backend data provider)
  // -----------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      platform: 'BOT MATRIX Engine',
      clusterStatus: 'Active',
      time: new Date().toISOString(),
    });
  });

  // 1. Bots Endpoints
  app.get('/api/bots', (req, res) => {
    res.json(botsDatabase);
  });

  app.post('/api/bots', (req, res) => {
    const data = req.body;
    const newId = data.id || Math.floor(10000000 + Math.random() * 90000000).toString();
    const newBot = {
      id: newId,
      botNumericId: newId,
      name: data.name || 'New Bot',
      username: data.username || `@bot_${newId.slice(-4)}_bot`,
      status: 'working',
      activeUsers: 1,
      totalCommands: 59,
      category: data.category || 'Operations',
      folder: data.folder || 'Main Bots',
      isPinned: false,
      lastActive: 'Just now',
      uptime: '100%',
      version: 'v1.0.0',
      token: data.token || '',
      commands: defaultCommands,
      envVars: [],
      fasterResponse: true,
      ...data,
    };
    botsDatabase = [newBot, ...botsDatabase];
    res.status(201).json(newBot);
  });

  app.put('/api/bots/:id', (req, res) => {
    const { id } = req.params;
    const index = botsDatabase.findIndex((b) => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    botsDatabase[index] = { ...botsDatabase[index], ...req.body };
    res.json(botsDatabase[index]);
  });

  app.delete('/api/bots/:id', (req, res) => {
    const { id } = req.params;
    botsDatabase = botsDatabase.filter((b) => b.id !== id);
    res.json({ success: true, id });
  });

  app.post('/api/bots/:id/toggle-status', (req, res) => {
    const { id } = req.params;
    const bot = botsDatabase.find((b) => b.id === id);
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    bot.status = bot.status === 'working' ? 'stopped' : 'working';
    bot.lastActive = 'Just now';
    res.json(bot);
  });

  // 2. Bot Store Endpoints
  app.get('/api/store/bots', (req, res) => {
    res.json(storeBotsDatabase);
  });

  app.post('/api/store/bots/:id/clone', (req, res) => {
    const { id } = req.params;
    const storeBot = storeBotsDatabase.find((s) => s.id === id);
    if (!storeBot) {
      return res.status(404).json({ error: 'Store bot not found' });
    }

    const newId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const cleanUsername = storeBot.botPayload.username?.replace('@', '') || storeBot.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const clonedBot = {
      id: newId,
      botNumericId: newId,
      name: `${storeBot.name}`,
      username: `@${cleanUsername}_clone`,
      status: 'working',
      activeUsers: 1,
      totalCommands: storeBot.botPayload.commands?.length || 12,
      category: storeBot.category,
      folder: 'Main Bots',
      isPinned: false,
      lastActive: 'Just now',
      uptime: '100%',
      version: storeBot.version,
      commands: storeBot.botPayload.commands || defaultCommands,
      envVars: [],
      fasterResponse: true,
    };

    botsDatabase = [clonedBot, ...botsDatabase];
    storeBot.clones += 1;
    res.status(201).json({ success: true, bot: clonedBot });
  });

  // 3. Broadcasts Endpoints
  app.get('/api/broadcasts', (req, res) => {
    res.json(broadcastsDatabase);
  });

  app.post('/api/broadcasts', (req, res) => {
    const data = req.body;
    const newBc = {
      id: `bc-${Date.now()}`,
      title: data.title || 'Broadcast Campaign',
      targetBotIds: data.targetBotIds || [],
      targetBotUsernames: data.targetBotUsernames || [],
      messageType: data.messageType || 'Text',
      messageText: data.messageText || '',
      parseMode: data.parseMode || 'HTML',
      inlineButtons: data.inlineButtons || [],
      status: 'Active',
      sentCount: 0,
      totalTargetUsers: data.totalTargetUsers || 100,
      failedCount: 0,
      failedRecipients: [],
      deliverySpeed: '150 msg/sec',
      createdAt: 'Just now',
      ...data,
    };
    broadcastsDatabase = [newBc, ...broadcastsDatabase];
    res.status(201).json(newBc);
  });

  app.put('/api/broadcasts/:id', (req, res) => {
    const { id } = req.params;
    const index = broadcastsDatabase.findIndex((b) => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }
    broadcastsDatabase[index] = { ...broadcastsDatabase[index], ...req.body };
    res.json(broadcastsDatabase[index]);
  });

  app.delete('/api/broadcasts/:id', (req, res) => {
    const { id } = req.params;
    broadcastsDatabase = broadcastsDatabase.filter((b) => b.id !== id);
    res.json({ success: true, id });
  });

  // 4. Audience Chats Endpoints
  app.get('/api/chats/:botId', (req, res) => {
    const { botId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = ((req.query.search as string) || '').toLowerCase();
    const filter = (req.query.filter as string) || 'All';

    let list = getAudienceForBot(botId);

    if (search) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.username.toLowerCase().includes(search) ||
          u.telegramId.includes(search)
      );
    }

    if (filter === 'Active') {
      list = list.filter((u) => !u.isBlocked);
    } else if (filter === 'Blocked') {
      list = list.filter((u) => u.isBlocked);
    }

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * limit;
    const paginated = list.slice(start, start + limit);

    res.json({
      users: paginated,
      total,
      page: safePage,
      totalPages,
    });
  });

  app.put('/api/chats/:botId/users/:userId/block', (req, res) => {
    const { botId, userId } = req.params;
    const list = getAudienceForBot(botId);
    const target = list.find((u) => u.id === userId);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    target.isBlocked = !target.isBlocked;
    res.json({ success: true, isBlocked: target.isBlocked });
  });

  app.post('/api/chats/:botId/users/:userId/reply', (req, res) => {
    res.json({ success: true, deliveredAt: new Date().toISOString() });
  });

  // 5. Database KV & Admins Endpoints
  app.get('/api/database/:botId', (req, res) => {
    const { botId } = req.params;
    const kvData = [
      { id: 'bd-1', key: 'bot_identifier_id', value: botId, type: 'string', category: 'System Config', lastUpdated: 'Live Active' },
      { id: 'bd-2', key: 'webhook_url', value: `https://api.telebotcreator.io/v1/webhook/${botId}`, type: 'string', category: 'Network', lastUpdated: 'Synchronized' },
      { id: 'bd-3', key: 'welcome_message', value: 'Welcome to BOT MATRIX automated node!', type: 'string', category: 'Runtime State', lastUpdated: '5 mins ago' },
      { id: 'bd-4', key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'Runtime State', lastUpdated: '1 hour ago' },
      { id: 'bd-5', key: 'rate_limit_per_min', value: '60', type: 'number', category: 'System Config', lastUpdated: 'Default' },
    ];

    const adminData = [
      { id: 'adm-1', telegramId: '61829103', username: '@ClusterAdmin', displayName: 'Matrix Master', role: 'SUPER_ADMIN', permissions: ['ALL_PERMISSIONS'], balanceUsdt: 500, joinedAt: '2026-08-01', lastActive: 'Active Now', status: 'active' },
    ];

    res.json({ kvData, adminData });
  });

  // 6. Notifications Endpoints
  app.get('/api/notifications', (req, res) => {
    res.json(notificationsDatabase);
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    const n = notificationsDatabase.find((item) => item.id === id);
    if (n) n.read = true;
    res.json({ success: true });
  });

  // 7. Settings Endpoints
  app.get('/api/settings', (req, res) => {
    res.json(platformSettingsDatabase);
  });

  app.put('/api/settings', (req, res) => {
    platformSettingsDatabase = { ...platformSettingsDatabase, ...req.body };
    res.json(platformSettingsDatabase);
  });

  // 8. Support Ticket Endpoint
  app.post('/api/help-support/ticket', (req, res) => {
    const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
    res.json({
      success: true,
      ticketId,
      message: 'Ticket received by BOT MATRIX Cluster Operations squad.',
      sla: 'Average response: 3 minutes',
    });
  });

  // -----------------------------------------------------------
  // VITE MIDDLEWARE (Development) vs STATIC SERVE (Production)
  // -----------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BOT MATRIX] Cluster Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
