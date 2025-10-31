import { api } from './EventServices';
import { 
  Category, 
  CategoryResponse, 
  CreateCategoryRequest, 
  CreateCategoryResponse 
} from '@/types/category';

export const categoryService = {
  // Get all categories
  async getCategories(): Promise<CategoryResponse> {
    const response = await api.getEvents('/service/categories');
    return response.data;
  },

  // Create a new category
  async createCategory(categoryData: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const response = await api.postEvents('/service/categories', categoryData);
    return response.data;
  },

  // Update a category
  async updateCategory(id: number, categoryData: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const response = await api.putEvent(`/service/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete a category
  async deleteCategory(id: number): Promise<{ success: boolean }> {
    const response = await api.deleteEvents(`/service/categories/${id}`);
    return response.data;
  },
}; 