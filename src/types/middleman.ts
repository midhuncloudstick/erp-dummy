export interface Middleman {
  response:{
    data:{
    id: number;
    full_name: string;
    phone_number: string;
    email: string;
    address: string;
    leadsCount?: number;
  }
  }
  }
  
  export interface CreateMiddlemanRequest {
    full_name: string;
    phone_number: string;
    email: string;
    address: string;
  }
  
  export interface CreateMiddlemanResponse {
    response: Middleman;
    success: boolean;
  }
  
  export interface MiddlemanListResponse {
    response: Middleman[];
    success: boolean;
    page?: number;
    limit?: number;
    total_pages?: number;
  }
  
  
  