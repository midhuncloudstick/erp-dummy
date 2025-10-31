export interface Industry {
  id: number;
  name: string;
}

// Use FullName to align with backend; keep first/last optional for compatibility



export interface Customer {
  id: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  company_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  country_code: string;
  note: string;
  industry_id: number;
  industry:string;
  industry_name:string;
  product_id?: number;
}
