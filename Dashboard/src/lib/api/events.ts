import api from '../axios';
import { EventDto, EventDetailDto, CreateEventCommand, UpdateEventCommand } from './types';

export async function getEvents(includePrivate: boolean = false): Promise<EventDto[]> {
  try {
    const res = await api.get<EventDto[]>('/Events', {
      params: { includePrivate }
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch events');
  }
}

export async function getEventsByCategory(categoryId: string, includePrivate: boolean = false): Promise<EventDto[]> {
  try {
    const res = await api.get<EventDto[]>(`/Events/category/${categoryId}`, {
      params: { includePrivate }
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch events by category');
  }
}

export async function getEventById(eventId: string): Promise<EventDetailDto> {
  try {
    const res = await api.get<EventDetailDto>(`/Events/${eventId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch event details');
  }
}

export async function createEvent(eventData: CreateEventCommand): Promise<EventDto> {
  try {
    const res = await api.post<EventDto>('/Events/CreateEvent', eventData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to create event');
  }
}

export async function updateEvent(eventId: string, eventData: UpdateEventCommand): Promise<EventDto> {
  try {
    const res = await api.put<EventDto>(`/Events/${eventId}`, eventData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to update event');
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    await api.delete(`/Events/${eventId}`);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to delete event');
  }
}