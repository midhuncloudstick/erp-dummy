import { api } from './EventServices';

export const ticketService = {


     async createTickets(data:FormData){
    const user = JSON.parse(localStorage.getItem('user') as string);

    // Construct the final URL
    const url = `customer/${user?.id}/support_ticket`;
    
    const response = await api.postEvents(url,data,{
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async fetchTicketsStaff(page?: number, limit?: number,searchTerm?:string, status?:string, priority?:string){
    const user = JSON.parse(localStorage.getItem('user') as string);
    const baseUrl = `staff/${user?.id}/support_ticket`;
    
    const queryParams = new URLSearchParams();

    // Conditionally add page and limit to query params
    if (page) queryParams.append("page", page.toString());
    if (limit) queryParams.append("limit", limit.toString());
    if (searchTerm) queryParams.append("search", searchTerm);
    if (status) queryParams.append("status", status);
    if (priority) queryParams.append("priority", priority);

    // Construct the final URL
    const url = `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await api.getEvents(url);
    return response.data;
  },


    async fetchOverviewStaff(date_period?: string){
    const user = JSON.parse(localStorage.getItem('user') as string);
    const baseUrl = `staff/${user?.id}/support_ticket/Overview`;
    
    const queryParams = new URLSearchParams();

    // Conditionally add date_period to query params
    if (date_period) queryParams.append("date_period", date_period);

    // Construct the final URL
    const url = `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await api.getEvents(url);
    return response.data;
  },


    async fetchTicketsCustomer(page?: number, limit?: number,searchTerm?:string, status?:string, priority?:string){
    const user = JSON.parse(localStorage.getItem('user') as string);
    const baseUrl = `customer/${user?.id}/support_ticket`;
    
    const queryParams = new URLSearchParams();

    // Conditionally add page and limit to query params
    if (page) queryParams.append("page", page.toString());
    queryParams.append("limit", "10");
    if (searchTerm) queryParams.append("search", searchTerm);
    if (status) queryParams.append("status", status);
    if (priority) queryParams.append("priority", priority);

    // Construct the final URL
    const url = `${baseUrl}${queryParams?.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await api.getEvents(url);
    return response.data;
  },

     async fetchTicketByIdCustomer(ticketId?: string){
    const user = JSON.parse(localStorage.getItem('user') as string);
    const baseUrl = `customer/${user?.id}/support_ticket/${ticketId}`;
    
    const queryParams = new URLSearchParams();
    // Construct the final URL
    const url = `${baseUrl}${queryParams?.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await api.getEvents(url);
    return response.data;
  },


   async getInvoicesById(invoiceId?: string): Promise<any> {
    const user = JSON.parse(localStorage.getItem('user')as string);
    const response = await api.getEvents(`customers/${user?.id}/invoices/${invoiceId}`);
    console.log("response",response);
    return response.data;
  },


  // Updated to accept page and limit
  async getTickets(page?: number, limit?: number){
    const user = JSON.parse(localStorage.getItem('user') as string);
    const baseUrl = `customers/${user?.id}/tickets`;
    
    const queryParams = new URLSearchParams();

    // Conditionally add page and limit to query params
    if (page) queryParams.append("page", page.toString());
    if (limit) queryParams.append("limit", limit.toString());

    // Construct the final URL
    const url = `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await api.getEvents(url);
    return response.data;
  },

   async getTicketsById(ticketId?: string): Promise<any> {
    const user = JSON.parse(localStorage.getItem('user')as string);
    const response = await api.getEvents(`customers/${user?.id}/tickets/${ticketId}`);
    console.log("response",response);
    return response.data;
  },

};