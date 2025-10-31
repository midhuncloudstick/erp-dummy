export interface ApiEmployee {
  id: number;
  profile_pic: string;
  full_name: string;
  company_id: number;
  company_name: string;
  role_id: number;
  role_name: string;
  department_id: number;
  department_name: string;
  email: string;
  phone_number: string;
  address: string;
  is_active: boolean;
  join_date: string;
}

export interface EmployeeResponse {
  response: {
    data: ApiEmployee[];
    limit: number;
    page: number;
    total_pages: number;
  };
  success: boolean;
}

// UI-friendly employee shape used by the Employees page
export interface UiEmployee {
  id: number;
  profilePic: string;
  fullName: string;
  role: string;
  department: string;
  email: string;
  phoneNumber: string;
  address: string;
  joinDate: string;
  is_active:boolean;
}

export function mapApiEmployeeToUi(apiEmployee: ApiEmployee): UiEmployee {
  return {
    id: apiEmployee.id,
    profilePic: apiEmployee.profile_pic || '',
    fullName: apiEmployee.full_name,
    role: apiEmployee.role_name,
    department: apiEmployee.department_name,
    email: apiEmployee.email,
    phoneNumber: apiEmployee.phone_number,
    address: apiEmployee.address,
    joinDate: apiEmployee.join_date,
    is_active:apiEmployee.is_active
  };
}


