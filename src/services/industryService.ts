import { api } from './EventServices';
import { IndustryResponse, CreateIndustryRequest, Industry } from '@/types/industry';

export const industryService = {
  async getIndustries(): Promise<IndustryResponse> {
    const response = await api.getEvents('/industry');
    return response.data;
  },

  async createIndustry(industryData: CreateIndustryRequest): Promise<Industry> {
    const response = await api.postEvents('/industry', industryData);
    return response.data;
  },

  async deleteIndustry(id: number): Promise<{ success: boolean }> {
    const response = await api.deleteEvents(`/industry/${id}`);
    return response.data;
  },
};
