// environmentalData.ts
import api from '../axios';
import { 
  EnvironmentalDataDto, 
  CreateEnvironmentalDataCommand, 
  UpdateEnvironmentalDataCommand 
} from './types';

export async function getEnvironmentalData(): Promise<EnvironmentalDataDto[]> {
  try {
    const res = await api.get<EnvironmentalDataDto[]>('/api/EnvironmentalData/GetEnvironmentalData');
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch environmental data');
  }
}

export async function createEnvironmentalData(data: CreateEnvironmentalDataCommand): Promise<void> {
  try {
    await api.post('/api/EnvironmentalData/CreateEnvironmentalData', data);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to create environmental data');
  }
}

export async function updateEnvironmentalData(data: UpdateEnvironmentalDataCommand): Promise<void> {
  try {
    await api.put('/api/EnvironmentalData/UpdateEnvironmentalData', data);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to update environmental data');
  }
}

export async function deleteEnvironmentalData(dataId: string): Promise<void> {
  try {
    await api.delete(`/api/EnvironmentalData/DeleteEnvironmentalData/${dataId}`);
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to delete environmental data');
  }
}