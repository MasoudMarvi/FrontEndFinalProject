// events.ts
import api from '../axios';
import { EventDto, EventDetailDto, EventFormData, EventStatus } from './types';

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

export async function createEvent(eventData: EventFormData): Promise<EventDto> {
  try {
    // Convert to FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add all non-file fields
    formData.append('Title', eventData.title);
    formData.append('Description', eventData.description || '');
    formData.append('Latitude', eventData.latitude.toString());
    formData.append('Longitude', eventData.longitude.toString());
    formData.append('StartDateTime', eventData.startDateTime);
    formData.append('EndDateTime', eventData.endDateTime);
    formData.append('IsPublic', eventData.isPublic.toString());
    formData.append('CategoryId', eventData.categoryId);
    
    // Add status if provided
    if (eventData.status !== undefined) {
      formData.append('Status', eventData.status.toString());
    }
    
    // Add image files if provided
    if (eventData.picture1) {
      formData.append('Picture1', eventData.picture1);
    }
    
    if (eventData.picture2) {
      formData.append('Picture2', eventData.picture2);
    }
    
    if (eventData.picture3) {
      formData.append('Picture3', eventData.picture3);
    }

    const res = await api.post<EventDto>('/Events/CreateEvent', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to create event');
  }
}

export async function updateEvent(eventData: EventFormData): Promise<EventDto> {
  try {
    // Convert to FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add all non-file fields
    formData.append('EventId', eventData.eventId!); // eventId is required for updates
    formData.append('Title', eventData.title);
    formData.append('Description', eventData.description || '');
    formData.append('Latitude', eventData.latitude.toString());
    formData.append('Longitude', eventData.longitude.toString());
    formData.append('StartDateTime', eventData.startDateTime);
    formData.append('EndDateTime', eventData.endDateTime);
    formData.append('IsPublic', eventData.isPublic.toString());
    formData.append('CategoryId', eventData.categoryId);
    
    // Add status if provided
    if (eventData.status !== undefined) {
      formData.append('Status', eventData.status.toString());
    }
    
    // Add image files if provided
    if (eventData.picture1) {
      formData.append('Picture1', eventData.picture1);
    }
    
    if (eventData.picture2) {
      formData.append('Picture2', eventData.picture2);
    }
    
    if (eventData.picture3) {
      formData.append('Picture3', eventData.picture3);
    }

    const res = await api.put<EventDto>(`/Events/UpdateEvent`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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