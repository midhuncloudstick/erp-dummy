import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { industryService } from '@/services/industryService';
import { Industry, CreateIndustryRequest } from '@/types/industry';

export const fetchIndustries = createAsyncThunk(
  'industries/fetchIndustries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await industryService.getIndustries();
    console.log("resposneIndustrys",response.response)

      return response.response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch industries');
    }
  }
);

export const createIndustry = createAsyncThunk(
  'industries/createIndustry',
  async (industryData: CreateIndustryRequest, { rejectWithValue }) => {
    try {
      const response = await industryService.createIndustry(industryData);
      return response.response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create industry');
    }
  }
);

export const deleteIndustry = createAsyncThunk(
  'industries/deleteIndustry',
  async (id: number, { rejectWithValue }) => {
    try {
      await industryService.deleteIndustry(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete industry');
    }
  }
);

interface IndustryState {
  industries: Industry[];
  loading: boolean;
  error: string | null;
}

const initialState: IndustryState = {
  industries: [],
  loading: false,
  error: null,
};

const industrySlice = createSlice({
  name: 'industries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIndustries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndustries.fulfilled, (state, action: PayloadAction<Industry[]>) => {
        state.loading = false;
        state.industries = action.payload.data;
        // console.log("hasjkdhasdhajkdhkahd",action.payload)
      })
      .addCase(fetchIndustries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createIndustry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIndustry.fulfilled, (state, action: PayloadAction<Industry>) => {
        state.loading = false;
        state.industries.push(action.payload);
      })
      .addCase(createIndustry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteIndustry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIndustry.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.industries = state.industries.filter((industry) => industry.id !== action.payload);
      })
      .addCase(deleteIndustry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = industrySlice.actions;
export default industrySlice.reducer;
