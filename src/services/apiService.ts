/**
 * Backend Data Integration Service for BOT MATRIX
 * All data comes from the FastAPI backend. No mock/fallback data.
 */
import { BotItem, StoreBot, BroadcastItem, BotChatUser, PlatformSettings, NotificationItem } from '../types';

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      localStorage.removeItem('access_token');
      window.dispatchEvent(new CustomEvent('auth:token_expired'));
      throw new Error('Session expired. Please log in again.');
    }

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = await res.json();
        detail = body.detail || body.message || body.msg || detail;
      } catch {}
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }

    return res.json() as Promise<T>;
  }

  async login(email: string, password: string, rememberMe = false, clientMetadata?: object) {
    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember_me: rememberMe, client_metadata: clientMetadata }),
    });
    if (data.access_token) localStorage.setItem('access_token', data.access_token);
    return data;
  }

  async register(email: string, password: string, confirmPassword: string, otp: string, clientMetadata?: object) {
    const data = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, confirm_password: confirmPassword, otp, client_metadata: clientMetadata }),
    });
    if (data.access_token) localStorage.setItem('access_token', data.access_token);
    return data;
  }

  async sendRegisterOtp(email: string) {
    return this.request<any>('/auth/register/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getProfile() {
    return this.request<any>('/profile');
  }

  async getBots(): Promise<BotItem[]> {
    return this.request<BotItem[]>('/bots');
  }

  async createBot(botData: Partial<BotItem> & { token?: string }): Promise<BotItem> {
    return this.request<BotItem>('/bots', {
      method: 'POST',
      body: JSON.stringify(botData),
    });
  }

  async updateBot(bot: BotItem): Promise<BotItem> {
    return this.request<BotItem>(`/bots/${bot.id}`, {
      method: 'PUT',
      body: JSON.stringify(bot),
    });
  }

  async deleteBot(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/bots/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleBotStatus(id: string): Promise<BotItem> {
    return this.request<BotItem>(`/bots/${id}/toggle-status`, {
      method: 'POST',
    });
  }

  async getStoreBots(): Promise<StoreBot[]> {
    return this.request<StoreBot[]>('/store/bots');
  }

  async cloneStoreBot(storeBotId: string): Promise<{ success: boolean; bot: BotItem }> {
    return this.request<{ success: boolean; bot: BotItem }>(`/store/bots/${storeBotId}/clone`, {
      method: 'POST',
    });
  }

  async getBroadcasts(): Promise<BroadcastItem[]> {
    return this.request<BroadcastItem[]>('/broadcasts');
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
    });
  }

  async deleteBroadcast(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/broadcasts/${id}`, {
      method: 'DELETE',
    });
  }

  async getAudienceUsers(botId: string, params?: { page?: number; limit?: number; search?: string; filter?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.filter) query.set('filter', params.filter);
    return this.request<{ users: BotChatUser[]; total: number; page: number; totalPages: number }>(
      `/chats/${botId}?${query.toString()}`
    );
  }

  async toggleBlockUser(botId: string, userId: string): Promise<{ success: boolean; isBlocked: boolean }> {
    return this.request<{ success: boolean; isBlocked: boolean }>(`/chats/${botId}/users/${userId}/block`, {
      method: 'PUT',
    });
  }

  async sendDirectReply(botId: string, userId: string, message: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/chats/${botId}/users/${userId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getBotDatabase(botId: string): Promise<{ kvData: any[]; adminData: any[] }> {
    return this.request(`/database/${botId}`);
  }

  async saveBotKV(botId: string, item: any): Promise<any> {
    return this.request(`/database/${botId}/kv`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async deleteBotKV(botId: string, itemId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/database/${botId}/kv/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications');
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async getSettings(): Promise<PlatformSettings | null> {
    return this.request<PlatformSettings | null>('/settings');
  }

  async updateSettings(settings: PlatformSettings): Promise<PlatformSettings> {
    return this.request<PlatformSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async submitSupportTicket(ticket: { name: string; email: string; message: string; category?: string }) {
    return this.request<{ success: boolean; ticketId: string }>('/help-support/ticket', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  async health() {
    return this.request<any>('/health');
  }
}

export const apiService = new ApiService();
