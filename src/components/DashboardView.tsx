import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Terminal,
  Bot,
  Zap,
  Clock,
  TrendingUp,
  Percent,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Server,
  ArrowUpRight,
  Sparkles,
  Info,
  Check,
  Activity,
} from 'lucide-react';
import { BotItem, ActivityHourData } from '../types';

interface DashboardViewProps {
  bots: BotItem[];
  activityData: ActivityHourData[];
  lastUpdatedTime: string;
  onNavigateToBots: () => void;
  onCreateBotClick: () => void;
  onSelectBot?: (bot: BotItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bots,
  activityData: initialActivityData,
  lastUpdatedTime,
  onNavigateToBots,
  onCreateBotClick,
  onSelectBot,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<ActivityHourData | null>(null);
  const [copiedBot, setCopiedBot] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<ActivityHourData[]>(initialActivityData);
  const [livePulse, setLivePulse] = useState(false);

  // Sync with initial activityData if passed
  useEffect(() => {
    if (initialActivityData && initialActivityData.length > 0) {
      setActivityData(initialActivityData);
    }
  }, [initialActivityData]);

  // Real-time live data updater ticker for dynamic animated graph
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityData((prev) => {
        if (!prev || prev.length === 0) return prev;
        // Subtly fluctuate the last 3 data points in real time to simulate live concurrency
        return prev.map((item, idx) => {
          if (idx >= prev.length - 2) {
            const delta = (Math.random() * 0.4 - 0.2);
            const newUsers = Math.max(0.4, Math.min(3.0, Number((item.users + delta).toFixed(1))));
            const newCmds = Math.max(10, item.commands + Math.floor(Math.random() * 6 - 2));
            return { ...item, users: newUsers, commands: newCmds };
          }
          return item;
        });
      });
      setLivePulse((p) => !p);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Compute live data-driven statistics directly from database bots
  const totalBotsCount = bots.length > 0 ? bots.length : 404;
  const workingBotsCount = bots.length > 0 ? bots.filter((b) => b.status === 'working').length : 148;
  const totalUsersCount = bots.length > 0
    ? bots.reduce((sum, b) => sum + (b.activeUsers || 0), 0)
    : 12;
  const totalCommandsCount = bots.length > 0
    ? bots.reduce((sum, b) => sum + (b.commandsCount || (b.commands?.length || 0)), 0)
    : 462;

  const statsLast24h = [
    {
      id: 'stat-active-users',
      label: 'Active users',
      value: totalUsersCount.toLocaleString(),
      change: '+14.2%',
      isPositive: true,
      icon: <Users className="w-5 h-5 text-blue-500" />,
      subtext: 'Across all active channels',
    },
    {
      id: 'stat-commands-run',
      label: 'Commands run',
      value: totalCommandsCount.toLocaleString(),
      change: '+28.5%',
      isPositive: true,
      icon: <Terminal className="w-5 h-5 text-indigo-500" />,
      subtext: 'Executed in last 24 hours',
    },
    {
      id: 'stat-total-bots',
      label: 'Total bots',
      value: totalBotsCount.toLocaleString(),
      change: '+6 this week',
      isPositive: true,
      icon: <Bot className="w-5 h-5 text-purple-500" />,
      subtext: 'Registered on platform',
    },
    {
      id: 'stat-working-bots',
      label: 'Working',
      value: workingBotsCount.toLocaleString(),
      change: '100% active',
      isPositive: true,
      icon: <Zap className="w-5 h-5 text-emerald-500" />,
      subtext: 'Currently polling & answering',
    },
  ];

  // Most active bots dynamically computed from backend bots
  const mostActiveBotsList = bots.length > 0
    ? [...bots]
        .sort((a, b) => (b.activeUsers || 0) - (a.activeUsers || 0))
        .slice(0, 5)
        .map((b) => ({
          username: b.username.startsWith('@') ? b.username : `@${b.username}`,
          status: b.status === 'working' ? 'Working' : 'Stopped',
          users: `${b.activeUsers || 0} users`,
          category: b.category || 'General',
        }))
    : [
        { username: '@VerificationOrganizationBot', status: 'Working', users: '6 users', category: 'Verification' },
        { username: '@Gghh_76bot', status: 'Working', users: '2 users', category: 'Assistant' },
        { username: '@DogsKopBot', status: 'Working', users: '1 users', category: 'Community' },
        { username: '@Super_Project_no_1_bot', status: 'Working', users: '1 users', category: 'Operations' },
        { username: '@NEWEARNIlNG_BOT', status: 'Working', users: '1 users', category: 'Earning Engine' },
      ];

  const handleCopy = (username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedBot(username);
    setTimeout(() => setCopiedBot(null), 1800);
  };

  // SVG Chart Dimensions & Calculation
  const chartWidth = 700;
  const chartHeight = 220;
  const paddingX = 45;
  const paddingY = 30;
  const maxY = 3.0;

  const points = activityData.map((d, index) => {
    const x = paddingX + (index / (activityData.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.users / maxY) * (chartHeight - paddingY * 2);
    return { x, y, data: d };
  });

  // Generate SVG path for smooth line
  const pathD = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = points[index - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Live Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-5 sm:p-6 rounded-3xl shadow-xl shadow-blue-500/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              Live Cluster Active
            </span>
            <span className="text-xs text-blue-100/90 font-mono">
              Updated: {lastUpdatedTime}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1.5 tracking-tight">
            Telegram Bot Creator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
            Monitor active bots, track real-time user commands, and supervise webhook routing health across the global node network.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCreateBotClick}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm shadow-md hover:bg-blue-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Create New Bot</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNavigateToBots}
            className="px-4 py-2.5 rounded-xl bg-blue-500/30 text-white font-semibold text-xs sm:text-sm hover:bg-blue-500/40 border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>View All Bots</span>
            <ArrowUpRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* SECTION 1: Last 24 hours (Active users 12, Commands run 462, Total bots 404, Working 148) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
              Last 24 hours
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Real-time Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLast24h.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-blue-400/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {stat.label}
                </span>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  {stat.icon}
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
                  {stat.change}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {stat.subtext}
              </p>

              {/* Subtle top indicator line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Activity Chart & Engagement Statistics */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Activity
              </h2>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
              Continuous 24-hour command &amp; user concurrency profile
            </p>
          </div>

          {/* Scale indicator legend */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Live Stream</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-500/30 border border-blue-500 inline-block" />
              Users Concurrency (0 - 3.0)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold text-xs">
              Peak 2:00 PM (3.0)
            </span>
          </div>
        </div>

        {/* Visual SVG Activity Chart */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[640px] relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 overflow-visible"
            >
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y-axis Horizontal Gridlines (0, 0.75, 1.5, 2.25, 3) */}
              {[0, 0.75, 1.5, 2.25, 3].map((val) => {
                const yPos = chartHeight - paddingY - (val / maxY) * (chartHeight - paddingY * 2);
                return (
                  <g key={`y-${val}`}>
                    <line
                      x1={paddingX}
                      y1={yPos}
                      x2={chartWidth - paddingX}
                      y2={yPos}
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      className="text-slate-300 dark:text-slate-800"
                    />
                    <text
                      x={paddingX - 10}
                      y={yPos + 4}
                      textAnchor="end"
                      className="fill-slate-700 dark:fill-slate-300 text-xs font-bold font-mono"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area under Curve - Animated */}
              <motion.path
                d={areaD}
                fill="url(#activityGradient)"
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />

              {/* Trend Line - Animated */}
              <motion.path
                d={pathD}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />

              {/* Points & Hover targets */}
              {points.map((p, idx) => (
                <g key={`pt-${idx}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={idx === points.length - 1 ? '6' : '4.5'}
                    className={`${
                      idx === points.length - 1
                        ? 'fill-blue-600 stroke-white stroke-2 animate-pulse'
                        : 'fill-white dark:fill-slate-900 stroke-blue-600 stroke-2'
                    } cursor-pointer transition-transform hover:scale-150`}
                    onMouseEnter={() => setHoveredPoint(p.data)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* X-axis tick labels */}
                  <text
                    x={p.x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className="fill-slate-800 dark:fill-slate-200 text-xs font-bold"
                  >
                    {p.data.time}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div className="absolute top-2 right-4 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs shadow-lg flex items-center gap-2 border border-slate-700">
                <span className="font-bold text-blue-400">{hoveredPoint.time}</span>
                <span>{hoveredPoint.users} Active Users</span>
                <span className="text-slate-300 font-medium">({hoveredPoint.commands} cmds)</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart Summary Metrics Row (Users: 12, Peak hour: 3, Avg / hour: 1, Active hrs: 6/24, Retention & Growth) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Users
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">
              12
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total concurrent</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Peak hour
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
              3
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">At 2:00 PM session</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Avg / hour
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">
              1
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Steady interaction</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Active hrs
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              6/24
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Key engagement zones</span>
          </div>

          {/* Retention Rate Column requested */}
          <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Retention rate
            </span>
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              88.4%
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              +4.2% MoM
            </span>
          </div>

          {/* Growth Percentage Column requested */}
          <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Growth %
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              +24.6%
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">New bot commands</span>
          </div>
        </div>

        {/* Concise summary / text-based insight requested */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950 dark:text-blue-100">
              Engagement Insight &amp; Concurrency Analysis
            </h4>
            <p className="text-xs text-blue-950 dark:text-blue-200 mt-1 leading-relaxed font-medium">
              Peak user volume reached 3 concurrent sessions at 2:00 PM with an hourly mean of 1 user. Active hours span 6 out of 24 daily periods with an 88.4% user retention rate. Automated Telegram polling responded under 29ms with flawless uptime.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Two-Column Section: Most Active Bots & Bots Lifecycle / Uptime */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Bots Card */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Most active bots
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                  Top performing bots sorted by live user sessions
                </p>
              </div>
              <button
                onClick={onNavigateToBots}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>Manage all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of 5 requested active bots */}
            <div className="space-y-2.5">
              {mostActiveBotsList.map((bot, idx) => {
                const matchedBot = bots.find((b) => b.username === bot.username);
                return (
                  <div
                    key={bot.username}
                    onClick={() => {
                      if (matchedBot && onSelectBot) {
                        onSelectBot(matchedBot);
                      } else {
                        onNavigateToBots();
                      }
                    }}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-xs cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                            {bot.username}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(bot.username);
                            }}
                            title="Copy username"
                            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-0.5"
                          >
                            {copiedBot === bot.username ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {bot.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Working status badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {bot.status}
                    </span>

                    {/* Active users counter */}
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono">
                      {bot.users}
                    </span>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
            <span>5 priority bot containers active</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              All webhooks healthy
            </span>
          </div>
        </div>

        {/* Bot Templates & Reliability Metrics Card */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bots &amp; Infrastructure
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                  Template deployments, transferred bots, and SLA
                </p>
              </div>
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                <Server className="w-4 h-4" />
              </span>
            </div>

            {/* Cloned from templates (70) & Transferred to you (89) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-50/70 dark:from-slate-800/40 dark:to-blue-950/20 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Cloned from templates
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                  70
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-400 font-bold">
                  Verified blueprints
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-indigo-50/70 dark:from-slate-800/40 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Transferred to you
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                  89
                </span>
                <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">
                  Direct ownership
                </span>
              </div>
            </div>

            {/* Uptime & Response Time */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Uptime
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  99.99%
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">0 downtime this month</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Response time
                  </span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                  29ms
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Fast webhook roundtrip</span>
              </div>
            </div>

            {/* Prompt's exact text requirement:
                "290ms to deliver consistent, high-performance interactions for all registered users. This ensures optimal reliability and user satisfaction across the entire bot network." */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <p className="text-xs text-slate-900 dark:text-slate-200 leading-relaxed font-medium">
                <strong className="text-slate-950 dark:text-white font-bold">Latency Benchmark </strong>
                290ms to deliver consistent, high-performance interactions for all registered users. This ensures optimal reliability and user satisfaction across the entire bot network.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
              Global Telegram Gateway
            </span>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
