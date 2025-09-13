import api from '../axios';
import { EventCategoryDto, CreateEventCategoryCommand, UpdateEventCategoryCommand } from './types';

export async function getEventCategories(): Promise<EventCategoryDto[]> {
  try {
    const res = await api.get<EventCategoryDto[]>('/EventCategories');
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch event categories');
  }
}

export async function getEventCategoryById(categoryId: string): Promise<EventCategoryDto> {
  try {
    const res = await api.get<EventCategoryDto>(`/EventCategories/${categoryId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch event category');
  }
}

export async function createEventCategory(categoryData: CreateEventCategoryCommand): Promise<EventCategoryDto> {
  try {
    const res = await api.post<EventCategoryDto>('/EventCategories', categoryData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to create event category');
  }
}

export async function updateEventCategory(
  categoryId: string,
  categoryData: UpdateEventCategoryCommand
): Promise<EventCategoryDto> {
  try {
    const res = await api.put<EventCategoryDto>(`/EventCategories/${categoryId}`, categoryData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to update event category');
  }
}

export async function deleteEventCategory(categoryId: string): Promise<void> {
  try {
    await api.delete(`/EventCategories/${categoryId}`);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to delete event category');
  }
}