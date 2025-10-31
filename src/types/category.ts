export interface Category {
  id: number;
  category: string;
}

export interface CategoryResponse {
  response: Category[];
  success: boolean;
}

export interface CreateCategoryRequest {
  category: string;
}

export interface CreateCategoryResponse {
  response: Category;
  success: boolean;
} 