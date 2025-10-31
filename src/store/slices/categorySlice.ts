import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoryService } from '@/services/categoryService';
import { Category, CreateCategoryRequest } from '@/types/category';

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories();
      console.log("fetchCAtegoires",response.response)
      return response.response;
    } catch (error: any) {
      // Extract specific error message from API response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch categories';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: CreateCategoryRequest, { rejectWithValue }) => {
    try {
      const response = await categoryService.createCategory(categoryData);
      return response.response;
    } catch (error: any) {
      // Extract specific error message from API response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create category';
      return rejectWithValue(errorMessage);
    }
  }
);

// State interface
interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  creatingCategory: boolean;
  createCategoryError: string | null;
}

// Initial state
const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  creatingCategory: false,
  createCategoryError: null,
};

// Slice
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createCategoryError = null;
    },
    clearCategories: (state) => {
      state.categories = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.creatingCategory = true;
        state.createCategoryError = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.creatingCategory = false;
        state.categories.push(action.payload.data);
        state.createCategoryError = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.creatingCategory = false;
        state.createCategoryError = action.payload as string;
      });
  },
});

export const { clearError, clearCategories } = categorySlice.actions;
export default categorySlice.reducer; 