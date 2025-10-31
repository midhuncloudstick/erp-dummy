import { CreateCustomerResponse, CustomerPaginationData } from './../../services/customerService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerService } from '@/services/customerService';
import { Customer, Industry } from '@/types/customer';


interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null,
  industries: Industry[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total_pages: number;
  
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  industries: [],
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  total_pages: 1,

};


export const fetchIndustries = createAsyncThunk('customers/fetchIndustries', async () => {
  const response = await customerService.getIndustries();
  console.log("industries",response.response)
  return response.response
  ;
});

export const createCustomer = createAsyncThunk<
  CreateCustomerResponse,              // Return type
  Omit<Customer, 'id'>,                // Argument type
  { rejectValue: string }              // Optional: reject type
>(
  'customers/createCustomer',
  async (customer, { rejectWithValue }) => {
    try {
      const response = await customerService.addCustomer(customer);
      return response.response;
    } catch (error: any) {
      console.log(error)
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error);
    }
  }
);

export const fetchCustomerList = createAsyncThunk<
    CustomerPaginationData, 
    { search?: string; page?: number; limit?: number; } 
>(
  "fetchcustomersList",
  async (
    params, 
    { rejectWithValue }
  ) => {
    try {
      const response = await customerService.getCustomer(params);
      return response.response;
      
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("An unexpected error occurred.");
    }
  }
);




export const fetchCustomerById = createAsyncThunk<Customer, { id: number }>(
  "fetchCustomerById",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerById(id);
      console.log(response.response)
      return response.response;
    }
    catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message);
    }

  }
)

export const updateCustomer = createAsyncThunk<
  Customer,
  { id: number; customer: Partial<Customer> }
>(
  "customers/updateCustomer",
  async ({ id, customer }, { rejectWithValue }) => {
    try {
      const response = await customerService.updateCustomer(id, customer)
      return response.response;
    } catch (error: any) {
       console.log("Errror in updationSlice",error)
      if (error.response && error.response.data) {
        return rejectWithValue(error.response);
      }
      return rejectWithValue(error);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "deleteCustomer",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await customerService.deleteCustomer(id)
      console.log("id",id)

      return response;
    } catch (error: any) {
      if (error.response && error.resposne.data) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message)
    }
  }
)

export const fetchCustomerProfile = createAsyncThunk(
  "fetchCustomerProfile",
  async(id:number,{rejectWithValue})=>{
    try{
       const response=await customerService.getCustomerProfile(id)
       console.log("CustomerProfileeeeeee!!!!",response)
       return response.response;
    }
    catch(error:any){
      if(error.response && error.response.data){
        return rejectWithValue(error.response.data.message)
      }
       return rejectWithValue(error.message)
    }
  }
)

export const updateCustomerProfile = createAsyncThunk<Customer,{id:number; payload: Partial<Customer>}>(
  "updateCustomerProfile",
  async({id,payload},{rejectWithValue})=>{
    try{
     const response = await customerService.updateCustomerProfile(id,payload);
     return response.response;
    }
    catch(error:any){
      if(error.response && error.response.data){
        return rejectWithValue(error.response.data.message)
      }
      return rejectWithValue(error.message)

    }
  })



const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIndustries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndustries.fulfilled, (state, action) => {
        state.loading = false;
        state.industries = action.payload.data;
      })
      .addCase(fetchIndustries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch industries';
      })
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.customers.push(action.payload.data);
        }
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message;
      })
      .addCase(fetchCustomerList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomerList.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload.data
        state.page = action.payload.page
        state.limit = action.payload.limit
        state.total_pages = action.payload.total_pages
        

      })
      .addCase(fetchCustomerList.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload.data
        console.log("selectedCustomer",action.payload)
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message
      })
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;

        // Update the customers array if customer exists
        const index = state.customers.findIndex(c => c.id === action.payload.data.id);
        if (index !== -1) {
          state.customers[index] = action.payload.data;
        } else {
          state.customers.push(action.payload.data);
        }

        // Update selectedCustomer if it matches
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message
      })
      .addCase(deleteCustomer.pending,(state)=>{
        state.loading = true;
        state.error=null;
      })
      .addCase(deleteCustomer.fulfilled,(state,action)=>{
        state.loading=false;
        state.customers =state.customers.filter(c => c.id !== action.payload.id)
      })
      .addCase(deleteCustomer.rejected,(state,action)=>{
        state.loading=false;
        state.error= action.error.message
      })
      .addCase(fetchCustomerProfile.pending,(state)=>{
        state.loading =true;
        state.error= null;
      })
      .addCase(fetchCustomerProfile.fulfilled,(state,action)=>{
        state.loading=false;
        state.selectedCustomer= action.payload.data;
        
      })
      .addCase(fetchCustomerProfile.rejected,(state,action)=>{
        state.loading=false;
        state.error= action.error.message
      })
      .addCase(updateCustomerProfile.pending, (state) =>{
         state.loading=true;
         state.error= null; 
      })
      .addCase(updateCustomerProfile.fulfilled,(state,action)=>{
        state.loading=false;
        state.error=null;
      })
      .addCase(updateCustomerProfile.rejected,(state,action)=>{
        state.loading=false;
        state.error=null;
      })
  }
});

export default customerSlice.reducer;
