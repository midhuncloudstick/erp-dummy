import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ticketService } from '@/services/ticketService';

export interface Overview {
 
  title: string;
  
  count: string;
  
  growth: string;
}



export interface SupportTicket {
    id: number;
    ticket_id: string;
    title: string;
    description: string;
    status: 'New' | 'Open' | 'Pending' | 'Customer-Reply' | 'Agent-Reply' | 'Resolved' | 'Closed'; // Using literal types for common statuses
    priority: 'Low' | 'Medium' | 'High' | 'Urgent'; // Using literal types for common priorities
    category: string;
    customer_id: number;
    customer_email: string;
    customer_name: string;
    assignee: string | null; // Can be a name string or null/empty if unassigned
    created_at: string; // ISO 8601 string, e.g., "2025-10-28T06:04:13.633647Z"
    last_response: string | null; // Assuming this is a timestamp or a message identifier
    message_id: string;
    conversation_id: string;
    email_references: string;
    ticket_messages: any[] | null; // Assuming this would be an array of message objects (or null)
    attached_files: any[] | null; // Assuming this would be an array of file objects (or null)
    customer: any | null; // Assuming this would be a detailed customer object (or null)
    TicketNotes: any[] | null; // Assuming this would be an array of note objects (or null)
}

export interface TicketState {
    tickets: SupportTicket[];
    selectedTicket: SupportTicket | null;
    loading: boolean;
    error: string | null;
    // Pagination metadata
    page: number;
    limit: number;
    totalPages: number;
    totalTickets: number;
    Overview?:Overview[];
}

export const createTicket = createAsyncThunk(
  'ticket/create',
  // Accepts an object for arguments
  async (data:FormData, { getState, rejectWithValue }) => {
    // Access the current limit from the state
    
    // Use provided page/limit or defaults
    try {
      // Pass both page and limit to the service
      const response = await ticketService.createTickets(data);
      
      return response.message;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch invoice');
    }
  }
);

export const fetchTicketStaff  = createAsyncThunk(
  'ticket/fetchStaff',
  // Accepts an object for arguments
  async ({page,limit,searchTerm,status,priority}:{page?:number,limit?:number,searchTerm?:string,status?:string,priority?:string}, { getState, rejectWithValue }) => {
    // Access the current limit from the state
    
    // Use provided page/limit or defaults
    try {
      // Pass both page and limit to the service
      const response = await ticketService.fetchTicketsStaff( page,limit,searchTerm,status,priority);
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tickets');
    }
  }
);

export const fetchOverviewStaff  = createAsyncThunk(
  'ticket/OverviewStaff',
  // Accepts an object for arguments
  async ({date_period}:{date_period?:string}, { getState, rejectWithValue }) => {
    // Access the current limit from the state
    
    // Use provided page/limit or defaults
    try {
      // Pass both page and limit to the service
      const response = await ticketService.fetchOverviewStaff(date_period);
      
      return response.message;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch Overview');
    }
  }
);

export const fetchTicketCustomer  = createAsyncThunk(
  'ticket/fetchCustomer',
  // Accepts an object for arguments
  async ({page,limit,searchTerm,status,priority}:{page?:number,limit?:number,searchTerm?:string,status?:string,priority?:string}, { getState, rejectWithValue }) => {
    // Access the current limit from the state
    
    // Use provided page/limit or defaults
    try {
      // Pass both page and limit to the service
      const response = await ticketService.fetchTicketsCustomer( page,limit,searchTerm,status,priority);
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tickets');
    }
  }
);

export const fetchTicketByIdCustomer  = createAsyncThunk(
  'ticket/fetchByIdCustomer',
  // Accepts an object for arguments
  async (ticketId:string, { getState, rejectWithValue }) => {
    // Access the current limit from the state
    
    // Use provided page/limit or defaults
    try {
      // Pass both page and limit to the service
      const response = await ticketService.fetchTicketByIdCustomer(ticketId);
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tickets');
    }
  }
);

export const fetchOverviewCustomer  = createAsyncThunk(
  'ticket/OverviewCustomer',
  // Accepts an object for arguments
  async ({date_period}:{date_period?:string}, { getState, rejectWithValue }) => {
    // Access the current limit from the state
    
    // Use provided page/limit or defaults
    try {
      // Pass both page and limit to the service
      const response = await ticketService.fetchOverviewStaff(date_period);
      
      return response.message;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch Overview');
    }
  }
);




const initialState:TicketState = {
  tickets:[],
  selectedTicket : null,
  loading: false,
  error: null,
  // Initial pagination state
  page: 1,
  limit: 10, // Default limit
  totalPages: 1,
  totalTickets: 0,
  Overview:[],
};

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Add a reducer to potentially set a new limit if needed
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1; // Reset page to 1 when limit changes
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicketStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketStaff.fulfilled, (state,action) => {
        state.loading = false;
        console.log("action.payload",action.payload);
        
        // Update state with data and pagination metadata from backend response
        state.tickets = action.payload.response.data;
        state.page = action.payload.response.page;
        state.limit = action.payload.response.limit;
        state.totalPages = action.payload.response.total_pages;
        state.totalTickets = action.payload.response.total_count;
      })
      .addCase(fetchTicketStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchTicketCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketCustomer.fulfilled, (state,action) => {
        state.loading = false;
        console.log("action.payload",action.payload);
        

         const { page,limit,total_pages,total_count,data } = action.payload.response;

        if (state.page === 1 || page !== state.page) {
          state.tickets =
            page === 1
              ? action.payload.response.data
              : [...state.tickets, ...action.payload.response.data];
        }

        state.page = page;
        state.totalPages = total_pages;
        state.totalTickets = total_count
        state.totalTickets = total_count;
        // state.loadingresults;



        
        // console.log("action.payload",action.payload);
        
        // Update state with data and pagination metadata from backend response
        // state.tickets.push(...action.payload.response.data);
        // state.page = action.payload.response.page;
        // state.limit = action.payload.response.limit;
        // state.totalPages = action.payload.response.total_pages;
        // state.totalTickets = action.payload.response.total_count;
      })
      .addCase(fetchTicketCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // .addCase(fetchinvoiceById.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchinvoiceById.fulfilled, (state,action) => {
      //   state.loading = false;
      //   state.selectedInvoice = action.payload;
      // })
      // .addCase(fetchinvoiceById.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload as string;
      // })
      .addCase(fetchTicketByIdCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketByIdCustomer.fulfilled, (state,action) => {
        state.loading = false;
        console.log("action.payload",action.payload);
        
        // Update state with data and pagination metadata from backend response
        state.selectedTicket = action.payload.response.data;
      })
      .addCase(fetchTicketByIdCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

   
  },
});

export const { clearError, setLimit } = invoiceSlice.actions;
export default invoiceSlice.reducer;