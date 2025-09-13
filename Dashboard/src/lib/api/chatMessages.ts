import api from '../axios';
import { ChatMessageDto, CreateChatMessageCommand, UpdateChatMessageCommand } from './types';

export async function getChatMessagesByEvent(eventId: string): Promise<ChatMessageDto[]> {
  try {
    const res = await api.get<ChatMessageDto[]>(`/ChatMessages/event/${eventId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch chat messages');
  }
}

export async function createChatMessage(messageData: CreateChatMessageCommand): Promise<ChatMessageDto> {
  try {
    const res = await api.post<ChatMessageDto>('/ChatMessages', messageData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to create chat message');
  }
}

export async function updateChatMessage(messageId: string, messageData: UpdateChatMessageCommand): Promise<ChatMessageDto> {
  try {
    const res = await api.put<ChatMessageDto>(`/ChatMessages/${messageId}`, messageData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to update chat message');
  }
}

export async function deleteChatMessage(messageId: string): Promise<void> {
  try {
    await api.delete(`/ChatMessages/${messageId}`);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to delete chat message');
  }
}