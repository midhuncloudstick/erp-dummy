import { api } from './EventServices';

export interface DashboardData {
  active_services: number;
  overdue_invoices: number;
  projects_count: number;
  support_tickets: number;
}

export interface DashboardResponse {
  data: DashboardData;
  success: boolean;
}

export const dashboardService = {
  async getDashboardData(customerId: number): Promise<DashboardResponse> {
    const response = await api.getEvents(`/customer/${customerId}/dashboard`);
    return response.data;
  },
};
