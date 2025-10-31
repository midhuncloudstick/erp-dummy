import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { serviceService } from '@/services/serviceService';
import { Service, CreateServiceRequest } from '@/types/service';
import axios from 'axios';

// Async thunks
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await serviceService.getServices(page, limit);
      console.log("repsosneService",response.response)
      return response.response;
    } catch (error: any) {
      // Extract specific error message from API response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch services';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createService = createAsyncThunk(
  'services/createService',
  async (serviceData: CreateServiceRequest, { rejectWithValue }) => {
    try {
      const response = await serviceService.createService(serviceData);
        console.log("ADDservice",response.response)

      return response.response;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
    return rejectWithValue(error.response?.data.error || "service creation failed");
     }
      return rejectWithValue('Failed to create service');
    }
  }
);

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, serviceData }: { id: number; serviceData: Partial<CreateServiceRequest> }, { rejectWithValue }) => {
    try {
      const response = await serviceService.updateService(id, serviceData);
      return response.response;
    } catch (error: any) {
      // Extract specific error message from API response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to update service';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await serviceService.deleteService(id);
      return { id, success: response.success };
    } catch (error: any) {
      // Extract specific error message from API response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to delete service';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getServiceById = createAsyncThunk(
  'services/getServiceById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await serviceService.getServiceById(id);
      console.log(response.response,"serviceById")
      return response.response;
    } catch (error: any) {
      // Extract specific error message from API response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch service';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleServiceStatus = createAsyncThunk(
  'services/toggleServiceStatus',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await serviceService.toggleServiceStatus(id);
      return { id, success: response.success };
    } catch (error: any) {
      // Extract specific error message from API response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to toggle service status';
      return rejectWithValue(errorMessage);
    }
  }
);

// State interface
interface ServiceState {
  services: Service[];
  currentService: Service | null;
  loading: boolean;
  error: string | null;
  creatingService: boolean;
  createServiceError: string | null;
  togglingStatus: { [key: number]: boolean };
  toggleError: string | null;
  deletingService: boolean;
  deleteError: string | null;
}

// Initial state
const initialState: ServiceState = {
  services: [],
  currentService: null,
  loading: false,
  error: null,
  creatingService: false,
  createServiceError: null,
  togglingStatus: {},
  toggleError: null,
  deletingService: false,
  deleteError: null,
};

// Slice
const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createServiceError = null;
      state.toggleError = null;
    },
    clearServices: (state) => {
      state.services = [];
    },
    clearCurrentService: (state) => {
      state.currentService = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch services
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action: PayloadAction<Service[]>) => {
        state.loading = false;
        state.services = action.payload.data;
        state.error = null;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create service
    builder
      .addCase(createService.pending, (state) => {
        state.creatingService = true;
        state.createServiceError = null;
      })
      .addCase(createService.fulfilled, (state, action: PayloadAction<Service>) => {
        state.creatingService = false;
        state.services.push(action.payload.data);
        state.createServiceError = null;
      })
      .addCase(createService.rejected, (state, action) => {
        state.creatingService = false;
        state.createServiceError = action.payload as string;
      });

    // Update service
    builder
      .addCase(updateService.pending, (state) => {
        state.creatingService = true;
        state.createServiceError = null;
      })
      .addCase(updateService.fulfilled, (state, action: PayloadAction<Service>) => {
        state.creatingService = false;
        // Update the service in the list
        const index = state.services.findIndex(s => s.id === action.payload.data.id);
        if (index !== -1) {
          state.services[index] = action.payload.data;
        }
        // Update current service if it's the one being edited
        if (state.currentService?.id === action.payload.data.id) {
          state.currentService = action.payload.data;
        }
        state.createServiceError = null;
        console.log("stateServicesss",state.currentService)
      })
      .addCase(updateService.rejected, (state, action) => {
        state.creatingService = false;
        state.createServiceError = action.payload as string;
      });

    // Delete service
    builder
      .addCase(deleteService.pending, (state) => {
        state.deletingService = true;
        state.deleteError = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.deletingService = false;
        // Remove the service from the list
        state.services = state.services.filter(s => s.id !== action.payload.id);
        // Clear current service if it's the one being deleted
        if (state.currentService?.id === action.payload.id) {
          state.currentService = null;
        }
        state.deleteError = null;
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.deletingService = false;
        state.deleteError = action.payload as string;
      });

    // Get service by ID
    builder
      .addCase(getServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getServiceById.fulfilled, (state, action: PayloadAction<Service>) => {
        state.loading = false;
        state.currentService = action.payload.data;
        state.error = null;
      })
      .addCase(getServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle service status
    builder
      .addCase(toggleServiceStatus.pending, (state, action) => {
        const id = action.meta.arg;
        state.togglingStatus[id] = true;
        state.toggleError = null;
      })
      .addCase(toggleServiceStatus.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.togglingStatus[id] = false;
        // Update the service status in the list
        const service = state.services.find(s => s.id === id);
        if (service) {
          service.status = service.status === 'active' ? 'inactive' : 'active';
        }
        state.toggleError = null;
      })
      .addCase(toggleServiceStatus.rejected, (state, action) => {
        const id = action.meta.arg;
        state.togglingStatus[id] = false;
        state.toggleError = action.payload as string;
      });
  },
});

export const { clearError, clearServices, clearCurrentService } = serviceSlice.actions;
export default serviceSlice.reducer; 