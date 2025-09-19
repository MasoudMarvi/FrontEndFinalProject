import api from '../axios';
import { AboutDto } from './types';

export async function getAbout(): Promise<AboutDto> {
  try {
   
    const res = await api.get<AboutDto>('/About');
    return res.data;
  } catch (err: any) {
    console.error('Error fetching About data:', err);
    throw new Error(err.response?.data?.message || 'Failed to fetch about information');
  }
}

export async function createOrUpdateAbout(title: string, content: string): Promise<void> {
  try {
    await api.post('/About', {
      title,
      content
    });
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to update about information');
  }
}