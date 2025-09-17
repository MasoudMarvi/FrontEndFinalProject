// environmentalData.ts
import api from '../axios';
import { 
  EnvironmentalDataDto, 
  UpdateEnvironmentalDataDto,
  CreateEnvironmentalDataCommand
} from './types';

export async function getEnvironmentalData(): Promise<EnvironmentalDataDto[]> {
  try {
    const res = await api.get<EnvironmentalDataDto[]>('/EnvironmentalData/GetEnvironmentalData');
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch environmental data');
  }
}

export async function getEnvironmentalDataByEventId(eventId: string): Promise<EnvironmentalDataDto[]> {
  try {
    const res = await api.get<EnvironmentalDataDto[]>(`/EnvironmentalData/GetEnvironmentalDataByEventId/${eventId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch environmental data for event');
  }
}

export async function createEnvironmentalData(data: CreateEnvironmentalDataCommand): Promise<void> {
  try {
    console.log('Creating environmental data with DTO:', data);
    await api.post('/EnvironmentalData/CreateEnvironmentalData', data);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to create environmental data');
  }
}

export async function updateEnvironmentalData(data: UpdateEnvironmentalDataDto): Promise<void> {
  try {
    await api.put('/EnvironmentalData/UpdateEnvironmentalData', data);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to update environmental data');
  }
}

export async function deleteEnvironmentalData(dataId: string): Promise<void> {
  try {
    await api.delete(`/EnvironmentalData/DeleteEnvironmentalData/${dataId}`);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to delete environmental data');
  }
}