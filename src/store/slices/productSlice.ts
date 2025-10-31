import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productService } from '@/services/productService';
import { Product, CreateProductRequest } from '@/types/product';
import axios from 'axios';

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: CreateProductRequest, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(productData);
      return response.response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data.error || "product creation failed");
      }
      return rejectWithValue('Failed to create product');
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts();
      return response.response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
);

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  creatingProduct: boolean;
  createProductError: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  creatingProduct: false,
  createProductError: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createProductError = null;
    },
    clearProducts: (state) => {
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload.data;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createProduct.pending, (state) => {
        state.creatingProduct = true;
        state.createProductError = null;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.creatingProduct = false;
        state.products.push(action.payload.data);
        state.createProductError = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.creatingProduct = false;
        state.createProductError = action.payload as string;
      });
  },
});

export const { clearError, clearProducts } = productSlice.actions;
export default productSlice.reducer;
