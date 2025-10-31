import { api } from './EventServices';
import { CreateMiddlemanRequest, CreateMiddlemanResponse, MiddlemanListResponse, Middleman } from '@/types/middleman';

export const middlemanService = {
  async createMiddleman(middlemanData: CreateMiddlemanRequest): Promise<CreateMiddlemanResponse> {
    const response = await api.postEvents('/middleman', middlemanData);
    return response.data;
  },

  async getMiddlemen(): Promise<MiddlemanListResponse> {
    const response = await api.getEvents('/middleman');
    return response.data;
  },
  
  async getMiddlemenById(id: string): Promise<Middleman> {
    const response = await api.getEvents(`/middleman/${id}`);
    console.log('Raw API response:', response.data);
    return response.data; // The API returns { data: Middleman, success: boolean }
  },

  async updateMiddleman(id: string, middlemanData: CreateMiddlemanRequest): Promise<CreateMiddlemanResponse> {
    const response = await api.patchEvent(`/middleman/${id}/update`, middlemanData);
    return response.data;
  },
  async deleteMiddleman(id: number): Promise<{ success: boolean }> {
    const response = await api.deleteEvents(`/middleman/${id}/delete`);
    return response.data;
  },
};


