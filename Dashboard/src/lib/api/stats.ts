// /lib/api/stats.ts
import api from '../axios';

export interface StatsDto {
  totalEvents: number;
  totalEventsPending: number;
  totalEventsActive: number;
  totalEventsCancelled: number;
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  totalCategories: number;
  topCategories: {
    categoryId: string;
    categoryName: string;
    description: string;
    events: Array<{
      eventId: string;
      title: string;
      description: string;
    }>;
  }[];
  totalChatMessages: number;
  totalChatMessagesToday: number;
  totalChatMessagesThisWeek: number;
  totalChatMessagesThisMonth: number;
}

export async function getStats(): Promise<StatsDto> {
  try {
    const response = await api.get<StatsDto>('/Stats');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
  }
}