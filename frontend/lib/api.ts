import axios from 'axios';
import { ProcessVideoResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const processVideo = async (videoUrl: string): Promise<ProcessVideoResponse> => {
  const response = await api.post<ProcessVideoResponse>('/api/video/process', {
    videoUrl,
  });
  return response.data;
};

export const checkHealth = async (): Promise<any> => {
  const response = await api.get('/api/video/health');
  return response.data;
};
