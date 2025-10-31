import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoiceService } from '@/services/invoiceService';

interface FetchInvoicesArgs {
  page?: number;
  limit?: number;
}

export const fetchinvoice = createAsyncThunk(
  'invoice/fetchinvoice',
  // Accepts an object for arguments
  async (args: FetchInvoicesArgs = {}, { getState, rejectWithValue }) => {
    // Access the current limit from the state
    const { invoice: { limit: currentLimit } } = getState() as { invoice: InvoiceState };
    
    // Use provided page/limit or defaults
    const pageToFetch = args.page || 1;
    const limitToFetch = args.limit || currentLimit;

    try {
      // Pass both page and limit to the service
      const response = await invoiceService.getInvoices(pageToFetch, limitToFetch);
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch invoice');
    }
  }
);

export const fetchinvoiceById = createAsyncThunk(
  'invoice/fetchinvoiceById',
  async (invoiceId:string, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoicesById(invoiceId);
      
      return response.message;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch invoice');
    }
  }
);

interface Customer {
  id: number;
  full_name: string;
  company_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  country: string;
  country_code: string;
  confirm_password?: string;
  industry?: {
    id: number;
    industry_name: string;
    description: string;
  };
  industry_id?: number | null;
  note?: string;
  password?: string;
  state: string;
  zip_code: string;
}
interface invoiceData {
  id: string;
  customer_id: number;
  ServiceID: number;
  provider: string;
  payment_type: string;
  recurring_type: string | null;
  capture_id: string;
  order_id: string;
  subscription_id: string;
  status: string;
  amount: string;
  invoice_date: string;
  due_date: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
  customers: Customer;
}

interface InvoiceState {
  invoice: invoiceData[]|[];
  selectedInvoice?: invoiceData | null;
  loading: boolean;
  error: string | null;
  // New fields for pagination
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}

const initialState: InvoiceState = {
  invoice: [],
  selectedInvoice: null,
  loading: false,
  error: null,
  // Initial pagination state
  page: 1,
  limit: 10, // Default limit
  totalPages: 1,
  totalRecords: 0,
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
      .addCase(fetchinvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchinvoice.fulfilled, (state,action) => {
        state.loading = false;
        console.log("action.payload",action.payload);
        
        // Update state with data and pagination metadata from backend response
        state.invoice = action.payload.response.message;
        state.page = action.payload.response.page;
        state.limit = action.payload.response.limit;
        state.totalPages = action.payload.response.total_pages;
        state.totalRecords = action.payload.response.total_invoices;
      })
      .addCase(fetchinvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchinvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchinvoiceById.fulfilled, (state,action) => {
        state.loading = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(fetchinvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
   
  },
});

export const { clearError, setLimit } = invoiceSlice.actions;
export default invoiceSlice.reducer;