import { api } from './EventServices';

export const invoiceService = {
  // Updated to accept page and limit
  async getInvoices(page?: number, limit?: number){
    const user = JSON.parse(localStorage.getItem('user') as string);
    const baseUrl = `customers/${user?.id}/invoices`;
    
    const queryParams = new URLSearchParams();

    // Conditionally add page and limit to query params
    if (page) queryParams.append("page", page.toString());
    if (limit) queryParams.append("limit", limit.toString());

    // Construct the final URL
    const url = `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await api.getEvents(url);
    return response.data;
  },

   async getInvoicesById(invoiceId?: string): Promise<any> {
    const user = JSON.parse(localStorage.getItem('user')as string);
    const response = await api.getEvents(`customers/${user?.id}/invoices/${invoiceId}`);
    console.log("response",response);
    return response.data;
  },

//   async createIndustry(industryData: CreateIndustryRequest): Promise<Industry> {
//     const response = await api.postEvents('/industry', industryData);
//     return response.data;
//   },

//   async deleteIndustry(id: number): Promise<{ success: boolean }> {
//     const response = await api.deleteEvents(`/industry/${id}`);
//     return response.data;
//   },
};