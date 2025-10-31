export interface Product {
  id: number;
  product_name: string;
  description: string;
}

export interface CreateProductRequest {
  product_name: string;
  description: string;
}

export interface CreateProductResponse {
  response: Product;
  success: boolean;
}

export interface ProductListResponse {
  response: Product[];
  success: boolean;
  page?: number;
  limit?: number;
  total_pages?: number;
}


