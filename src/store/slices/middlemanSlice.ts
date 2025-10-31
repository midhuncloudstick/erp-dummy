import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { middlemanService } from '@/services/middlemanService';
import { Middleman, CreateMiddlemanRequest } from '@/types/middleman';
import axios from 'axios';

export const createMiddleman = createAsyncThunk(
  'middlemen/createMiddleman',
  async (middlemanData: CreateMiddlemanRequest, { rejectWithValue }) => {
    try {
      const response = await middlemanService.createMiddleman(middlemanData);
      return response.response;
    } catch (error) {
      console.log("ErrorinMiddlemanCreation",error.response?.data.error)
   if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data.error || "middleMan creation failed");
      }
      return rejectWithValue('Failed to create middleman');
    }   
  }
);

export const fetchMiddlemen = createAsyncThunk(
  'middlemen/fetchMiddlemen',
  async (_, { rejectWithValue }) => {
    try {
      const response = await middlemanService.getMiddlemen();
      console.log("middlemanfetch",response.response)
      return response.response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch middlemen');
    }
  }
);

export const fetchMiddlemanById = createAsyncThunk(
  'middlemen/fetchMiddlemanById',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Fetching middleman by ID:', id);
      const response = await middlemanService.getMiddlemenById(id);
      console.log('API response:', response.response);
      return response.response;
    } catch (error) {
      console.error('Error fetching middleman:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch middleman');
    }
  }
);

export const updateMiddleman = createAsyncThunk(
  'middlemen/updateMiddleman',
  async ({ id, middlemanData }: { id: string; middlemanData: CreateMiddlemanRequest }, { rejectWithValue }) => {
    try {
      const response = await middlemanService.updateMiddleman(id, middlemanData);
      return response.response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update middleman');
    }
  }
);
export const deleteMiddleman = createAsyncThunk(
    'middlemen/deleteMiddleman',
    async (id: number, { rejectWithValue }) => {
      try {
        await middlemanService.deleteMiddleman(id);
        return id;
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete middleman');
      }
    }
  );

interface MiddlemanState {
  middlemen: Middleman[];
  currentMiddleman: Middleman | null;
  loading: boolean;
  error: string | null;
  creatingMiddleman: boolean;
  createMiddlemanError: string | null;
  updatingMiddleman: boolean;
  updateMiddlemanError: string | null;
}

const initialState: MiddlemanState = {
  middlemen: [],
  currentMiddleman: null,
  loading: false,
  error: null,
  creatingMiddleman: false,
  createMiddlemanError: null,
  updatingMiddleman: false,
  updateMiddlemanError: null,
};

const middlemanSlice = createSlice({
  name: 'middlemen',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createMiddlemanError = null;
      state.updateMiddlemanError = null;
    },
    clearMiddlemen: (state) => {
      state.middlemen = [];
    },
    clearCurrentMiddleman: (state) => {
      state.currentMiddleman = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMiddlemen.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMiddlemen.fulfilled, (state, action: PayloadAction<Middleman[]>) => {
        state.loading = false;
        state.middlemen = action.payload.data;
        state.error = null;
      })
      .addCase(fetchMiddlemen.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMiddlemanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMiddlemanById.fulfilled, (state, action: PayloadAction<Middleman>) => {
        state.loading = false;
        state.currentMiddleman = action.payload.data;
        state.error = null;
      })
      .addCase(fetchMiddlemanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createMiddleman.pending, (state) => {
        state.creatingMiddleman = true;
        state.createMiddlemanError = null;
      })
      .addCase(createMiddleman.fulfilled, (state, action: PayloadAction<Middleman>) => {
        state.creatingMiddleman = false;
        state.middlemen.push(action.payload);
        state.createMiddlemanError = null;
      })
      .addCase(createMiddleman.rejected, (state, action) => {
        state.creatingMiddleman = false;
        state.createMiddlemanError = action.payload as string;
      })
      .addCase(deleteMiddleman.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMiddleman.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.middlemen = state.middlemen.filter((middleman) => middleman.id !== action.payload);
      })
      .addCase(deleteMiddleman.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });;

    builder
      .addCase(updateMiddleman.pending, (state) => {
        state.updatingMiddleman = true;
        state.updateMiddlemanError = null;
      })
      .addCase(updateMiddleman.fulfilled, (state, action: PayloadAction<Middleman>) => {
        state.updatingMiddleman = false;
        // Update the middleman in the list
        const index = state.middlemen.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.middlemen[index] = action.payload;
        }
        state.updateMiddlemanError = null;
      })
      .addCase(updateMiddleman.rejected, (state, action) => {
        state.updatingMiddleman = false;
        state.updateMiddlemanError = action.payload as string;
      });
  },
});

export const { clearError, clearMiddlemen, clearCurrentMiddleman } = middlemanSlice.actions;
export default middlemanSlice.reducer;