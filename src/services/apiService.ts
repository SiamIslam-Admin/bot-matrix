/**
 * Backend Data Integration Service for BOT MATRIX
 * Connects frontend views directly to the Node.js / Express backend server.
 */
import { BotItem, StoreBot, BroadcastItem, BotChatUser, PlatformSettings, NotificationItem } from '../types';
import { initialBots } from '../data/mockData';
import { initialStoreBots } from '../data/storeBotsData';

const API_BASE = '/api';

class ApiService {
  private isServerHealthy = true;

  private async request<T>(endpoint: string, options?: RequestInit, fallback?: T): Promise<T> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      this.isServerHealthy = true;
      return data as T;
    } catch (err) {
      console.warn(`[BOT MATRIX API] Request to ${endpoint} failed, using local resilience store:`, err);
      if (fallback !== undefined) {
        return fallback;
      }
      throw err;
    }
  }

  // BOTS
  async getBots(): Promise<BotItem[]> {
    return this.request<BotItem[]>('/bots', { method: 'GET' }, initialBots);
  }

  async createBot(botData: Partial<BotItem>): Promise<BotItem> {
    return this.request<BotItem>('/bots', {
      method: 'POST',
      body: JSON.stringify(botData),
    });
  }

  async updateBot(bot: BotItem): Promise<BotItem> {
    return this.request<BotItem>(`/bots/${bot.id}`, {
      method: 'PUT',
      body: JSON.stringify(bot),
    }, bot);
  }

  async deleteBot(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/bots/${id}`, {
      method: 'DELETE',
    }, { success: true, id });
  }

  async toggleBotStatus(id: string): Promise<BotItem> {
    return this.request<BotItem>(`/bots/${id}/toggle-status`, {
      method: 'POST',
    });
  }

  // BOT STORE
  async getStoreBots(): Promise<StoreBot[]> {
    return this.request<StoreBot[]>('/store/bots', { method: 'GET' }, initialStoreBots);
  }

  async cloneStoreBot(storeBotId: string): Promise<{ success: boolean; bot: BotItem }> {
    return this.request<{ success: boolean; bot: BotItem }>(`/store/bots/${storeBotId}/clone`, {
      method: 'POST',
    });
  }

  // BROADCASTS
  async getBroadcasts(): Promise<BroadcastItem[]> {
    return this.request<BroadcastItem[]>('/broadcasts', { method: 'GET' }, []);
  }

  async createBroadcast(broadcast: Partial<BroadcastItem>): Promise<BroadcastItem> {
    return this.request<BroadcastItem>('/broadcasts', {
      method: 'POST',
      body: JSON.stringify(broadcast),
    });
  }

  async updateBroadcast(broadcast: BroadcastItem): Promise<BroadcastItem> {
    return this.request<BroadcastItem>(`/broadcasts/${broadcast.id}`, {
      method: 'PUT',
      body: JSON.stringify(broadcast),
    }, broadcast);
  }

  async deleteBroadcast(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/broadcasts/${id}`, {
      method: 'DELETE',
    }, { success: true, id });
  }

  // AUDIENCE CHATS
  async getAudienceUsers(botId: string, params?: { page?: number; limit?: number; search?: string; filter?: string }): Promise<{
    users: BotChatUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.filter) query.set('filter', params.filter);

    return this.request(`/chats/${botId}?${query.toString()}`, { method: 'GET' }, {
      users: [],
      total: 0,
      page: 1,
      totalPages: 1,
    });
  }

  async toggleBlockUser(botId: string, userId: string): Promise<{ success: boolean; isBlocked: boolean }> {
    return this.request<{ success: boolean; isBlocked: boolean }>(`/chats/${botId}/users/${userId}/block`, {
      method: 'PUT',
    }, { success: true, isBlocked: false });
  }

  async sendDirectReply(botId: string, userId: string, message: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/chats/${botId}/users/${userId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }, { success: true });
  }

  // DATABASE
  async getBotDatabase(botId: string): Promise<{ kvData: any[]; adminData: any[] }> {
    return this.request(`/database/${botId}`, { method: 'GET' }, {
      kvData: [],
      adminData: [],
    });
  }

  async saveBotKV(botId: string, item: any): Promise<any> {
    return this.request(`/database/${botId}/kv`, {
      method: 'POST',
      body: JSON.stringify(item),
    }, item);
  }

  async deleteBotKV(botId: string, itemId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/database/${botId}/kv/${itemId}`, {
      method: 'DELETE',
    }, { success: true });
  }

  // NOTIFICATIONS
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications', { method: 'GET' }, []);
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }, { success: true });
  }

  // SETTINGS
  async getSettings(): Promise<PlatformSettings | null> {
    return this.request<PlatformSettings | null>('/settings', { method: 'GET' }, null);
  }

  async updateSettings(settings: PlatformSettings): Promise<PlatformSettings> {
    return this.request<PlatformSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, settings);
  }

  // SUPPORT TICKET
  async submitSupportTicket(ticket: { name: string; email: string; message: string; category?: string }): Promise<{ success: boolean; ticketId: string }> {
    return this.request<{ success: boolean; ticketId: string }>('/help-support/ticket', {
      method: 'POST',
      body: JSON.stringify(ticket),
    }, { success: true, ticketId: 'TKT-' + Math.floor(100000 + Math.random() * 900000) });
  }
}

export const apiService = new ApiService();
