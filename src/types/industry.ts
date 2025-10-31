export interface Industry {
data :{
    id: number;
  industry_name: string;
  description: string;
}
}

export interface IndustryResponse {
  response: Industry[];
  limit: number;
  page: number;
  success: boolean;
  total_industries: number;
  total_pages: number;
}

export interface CreateIndustryRequest {
  industry_name: string;
  description: string;
}
