import React from 'react';

/** Basic animated pulse skeleton block */
export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/70 rounded-xl ${className}`}
  />
);

/** 1. Dashboard View Skeleton */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-48 rounded-lg" />
          <SkeletonBlock className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex gap-2.5">
          <SkeletonBlock className="h-9 w-28 rounded-xl" />
          <SkeletonBlock className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* 4 Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4"
          >
            <div className="flex items-center justify-between">
              <SkeletonBlock className="w-10 h-10 rounded-2xl" />
              <SkeletonBlock className="w-16 h-5 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <SkeletonBlock className="h-8 w-24 rounded-lg" />
              <SkeletonBlock className="h-3.5 w-32 rounded-md" />
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <SkeletonBlock className="h-3 w-40 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart & Telemetry Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Box */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-44 rounded-lg" />
              <SkeletonBlock className="h-3.5 w-60 rounded-md" />
            </div>
            <SkeletonBlock className="h-8 w-28 rounded-xl" />
          </div>

          {/* Simulated chart graph bars */}
          <div className="h-64 flex items-end justify-between gap-3 pt-8 px-2">
            {[40, 65, 30, 85, 55, 95, 70, 45, 80, 60, 90, 75].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <SkeletonBlock
                  className="w-full rounded-t-lg transition-all"
                  style={{ height: `${val}%` } as any}
                />
                <SkeletonBlock className="w-4 h-2 rounded-xs" />
              </div>
            ))}
          </div>
        </div>

        {/* Status / Quick Actions Column */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <SkeletonBlock className="h-5 w-36 rounded-lg" />
          <SkeletonBlock className="h-3.5 w-48 rounded-md" />

          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="w-8 h-8 rounded-xl" />
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-24 rounded-md" />
                    <SkeletonBlock className="h-2.5 w-16 rounded-md" />
                  </div>
                </div>
                <SkeletonBlock className="w-12 h-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bots List Skeleton */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-5 w-40 rounded-lg" />
          <SkeletonBlock className="h-7 w-24 rounded-xl" />
        </div>
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <SkeletonBlock className="w-10 h-10 rounded-2xl" />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-4 w-32 rounded-md" />
                    <SkeletonBlock className="h-4 w-16 rounded-full" />
                  </div>
                  <SkeletonBlock className="h-3 w-48 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-8 w-20 rounded-xl" />
                <SkeletonBlock className="h-8 w-8 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** 2. Bot Cards Grid Skeleton (My Bots) */
export const BotGridSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-44 rounded-lg" />
          <SkeletonBlock className="h-4 w-64 rounded-md" />
        </div>
        <div className="flex gap-2.5">
          <SkeletonBlock className="h-9 w-32 rounded-xl" />
          <SkeletonBlock className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* Search & Folder Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <SkeletonBlock className="h-11 flex-1 rounded-2xl" />
        <div className="flex gap-2 overflow-hidden">
          <SkeletonBlock className="h-11 w-24 rounded-2xl" />
          <SkeletonBlock className="h-11 w-24 rounded-2xl" />
          <SkeletonBlock className="h-11 w-24 rounded-2xl" />
        </div>
      </div>

      {/* Grid of Bot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="w-12 h-12 rounded-2xl shrink-0" />
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-4 w-32 rounded-md" />
                  <SkeletonBlock className="h-3 w-24 rounded-md" />
                </div>
              </div>
              <SkeletonBlock className="w-16 h-6 rounded-full" />
            </div>

            {/* Metrics Box */}
            <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 flex justify-between">
              <div className="space-y-1">
                <SkeletonBlock className="h-3 w-16 rounded-xs" />
                <SkeletonBlock className="h-4 w-10 rounded-xs" />
              </div>
              <div className="space-y-1">
                <SkeletonBlock className="h-3 w-16 rounded-xs" />
                <SkeletonBlock className="h-4 w-12 rounded-xs" />
              </div>
              <div className="space-y-1">
                <SkeletonBlock className="h-3 w-16 rounded-xs" />
                <SkeletonBlock className="h-4 w-14 rounded-xs" />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/60">
              <SkeletonBlock className="h-8 w-24 rounded-xl" />
              <div className="flex gap-1.5">
                <SkeletonBlock className="h-8 w-8 rounded-xl" />
                <SkeletonBlock className="h-8 w-8 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Dedicated cards-only skeleton for MyBots list transitions */
export const MyBotsCardsSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <SkeletonBlock className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
              <SkeletonBlock className="h-3.5 w-24 rounded-md" />
              <SkeletonBlock className="h-2.5 w-16 rounded-md" />
            </div>
          </div>
          <SkeletonBlock className="w-12 h-5 rounded-full" />
        </div>
        <SkeletonBlock className="h-12 w-full rounded-xl" />
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
          <SkeletonBlock className="h-7 w-20 rounded-lg" />
          <SkeletonBlock className="h-7 w-16 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

/** 3. Bot Store Skeleton */
export const BotStoreSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Banner Skeleton */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <SkeletonBlock className="h-7 w-64 rounded-lg" />
        <SkeletonBlock className="h-4 w-96 max-w-full rounded-md" />
        <div className="pt-2 flex gap-3">
          <SkeletonBlock className="h-10 flex-1 max-w-md rounded-2xl" />
          <SkeletonBlock className="h-10 w-28 rounded-2xl" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBlock key={i} className="h-9 w-24 rounded-xl" />
        ))}
      </div>

      {/* Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="w-11 h-11 rounded-2xl" />
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-4 w-32 rounded-md" />
                  <SkeletonBlock className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <SkeletonBlock className="w-14 h-5 rounded-full" />
            </div>

            <SkeletonBlock className="h-10 w-full rounded-xl" />

            <div className="flex gap-2">
              <SkeletonBlock className="h-5 w-16 rounded-md" />
              <SkeletonBlock className="h-5 w-20 rounded-md" />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <SkeletonBlock className="h-4 w-28 rounded-md" />
              <SkeletonBlock className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** 4. Table / List View Skeleton (Transfers, Recycle Bin, Notifications) */
export const TableListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-48 rounded-lg" />
          <SkeletonBlock className="h-4 w-72 rounded-md" />
        </div>
        <SkeletonBlock className="h-9 w-28 rounded-xl" />
      </div>

      {/* Table Container */}
      <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/40 flex items-center justify-between">
          <SkeletonBlock className="h-4 w-28 rounded-md" />
          <SkeletonBlock className="h-4 w-36 rounded-md" />
          <SkeletonBlock className="h-4 w-20 rounded-md" />
        </div>

        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="w-9 h-9 rounded-xl shrink-0" />
              <div className="space-y-1.5">
                <SkeletonBlock className="h-4 w-40 rounded-md" />
                <SkeletonBlock className="h-3 w-28 rounded-md" />
              </div>
            </div>
            <div className="hidden sm:block space-y-1">
              <SkeletonBlock className="h-3.5 w-32 rounded-md" />
              <SkeletonBlock className="h-3 w-20 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-7 w-20 rounded-full" />
              <SkeletonBlock className="h-8 w-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** 5. Audience List Skeleton (Paginated chats list) */
export const AudienceListSkeleton: React.FC<{ rows?: number }> = ({ rows = 8 }) => {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <SkeletonBlock className="w-11 h-11 rounded-full shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-4 w-32 rounded-md" />
                <SkeletonBlock className="h-4 w-14 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-3 w-20 rounded-md" />
                <SkeletonBlock className="h-3 w-24 rounded-md" />
              </div>
              <SkeletonBlock className="h-3 w-48 sm:w-64 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <SkeletonBlock className="h-8 w-20 rounded-xl" />
            <SkeletonBlock className="h-8 w-8 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

/** 6. Database Table Skeleton (KV and Admin table pagination) */
export const DatabaseTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
        <SkeletonBlock className="h-4 w-28 rounded-md" />
        <SkeletonBlock className="h-4 w-20 rounded-md" />
        <SkeletonBlock className="h-4 w-36 rounded-md" />
        <SkeletonBlock className="h-4 w-24 rounded-md" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="w-4 h-4 rounded-md" />
            <SkeletonBlock className="h-4 w-36 rounded-md" />
          </div>
          <SkeletonBlock className="h-5 w-16 rounded-md" />
          <SkeletonBlock className="h-4 w-24 rounded-md hidden sm:block" />
          <SkeletonBlock className="h-4 w-40 rounded-md" />
          <div className="flex items-center gap-1.5">
            <SkeletonBlock className="h-7 w-7 rounded-lg" />
            <SkeletonBlock className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

/** 7. Broadcast Cards Skeleton (Broadcast pagination) */
export const BroadcastCardsSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <SkeletonBlock className="h-4 w-36 rounded-md" />
              <SkeletonBlock className="h-3 w-24 rounded-md" />
            </div>
            <SkeletonBlock className="w-16 h-6 rounded-full" />
          </div>
          <SkeletonBlock className="h-12 w-full rounded-2xl" />
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-full rounded-md" />
            <SkeletonBlock className="h-2 w-full rounded-full" />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <SkeletonBlock className="h-4 w-20 rounded-md" />
            <SkeletonBlock className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

/** 8. Compact Bot Store Grid Skeleton */
export const CompactStoreGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1">
                <SkeletonBlock className="h-3.5 w-24 rounded-md" />
                <SkeletonBlock className="h-2.5 w-16 rounded-md" />
              </div>
            </div>
            <SkeletonBlock className="w-12 h-4 rounded-full" />
          </div>
          <SkeletonBlock className="h-8 w-full rounded-lg" />
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <SkeletonBlock className="h-3 w-16 rounded-md" />
            <SkeletonBlock className="h-3.5 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

/** 8b. MyBots View List Skeleton */
export const MyBotsListSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <SkeletonBlock className="w-10 h-10 rounded-2xl shrink-0" />
            <div className="space-y-1.5">
              <SkeletonBlock className="h-4 w-32 rounded-md" />
              <SkeletonBlock className="h-3 w-20 rounded-md" />
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <SkeletonBlock className="h-4 w-24 rounded-md" />
            <SkeletonBlock className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-8 w-20 rounded-xl" />
            <SkeletonBlock className="h-8 w-8 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

/** 9. Bot Details Page Skeleton */
export const BotDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-9 w-36 rounded-xl" />
        <SkeletonBlock className="h-5 w-28 rounded-md" />
      </div>
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="w-16 h-16 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <SkeletonBlock className="h-6 w-48 rounded-lg" />
              <SkeletonBlock className="h-4 w-64 rounded-md" />
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-10 w-32 rounded-xl" />
            <SkeletonBlock className="h-10 w-32 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

/** 10. Generic Full Page Skeleton */
export const GenericPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-56 rounded-lg" />
        <SkeletonBlock className="h-4 w-80 rounded-md" />
      </div>
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-5">
        <SkeletonBlock className="h-6 w-44 rounded-lg" />
        <SkeletonBlock className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <SkeletonBlock className="h-16 rounded-2xl" />
          <SkeletonBlock className="h-16 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

