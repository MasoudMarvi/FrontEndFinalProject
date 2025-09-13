import api from '../axios';
import { AboutDto } from './types';

export async function getAbout(): Promise<AboutDto> {
  try {
    const res = await api.get<AboutDto>('/About');
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch about information');
  }
}