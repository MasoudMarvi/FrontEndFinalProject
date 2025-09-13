import api from '../axios';
import { CreateContactMessageCommand } from './types';

// Define the response type based on what your API returns
export interface ContactMessageDto {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export async function createContactMessage(messageData: CreateContactMessageCommand): Promise<void> {
  try {
    await api.post('/ContactMessages', messageData);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to send contact message');
  }
}

export async function getContactMessages(): Promise<ContactMessageDto[]> {
  try {
    const res = await api.get<ContactMessageDto[]>('/ContactMessages');
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch contact messages');
  }
}

export async function getContactMessageById(messageId: string): Promise<ContactMessageDto> {
  try {
    const res = await api.get<ContactMessageDto>(`/ContactMessages/${messageId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch contact message');
  }
}