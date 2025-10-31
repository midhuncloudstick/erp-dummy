import { api } from './EventServices';
import { CreateProductRequest, CreateProductResponse, ProductListResponse } from '@/types/product';

export const productService = {
  async createProduct(productData: CreateProductRequest): Promise<CreateProductResponse> {
    const response = await api.postEvents('/product', productData);
    return response.data;
  },

  async getProducts(): Promise<ProductListResponse> {
    const response = await api.getEvents('/product');
    return response.data;
  },
};


