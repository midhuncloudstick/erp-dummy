export interface Role {
    id: number;
    name: string;
    description: string;
  }
  
  export interface RoleResponse {
    data: Role[];
    success: boolean;
    is_active: boolean;
  }
  
  export interface CreateRoleRequest {
    name: string;
    description: string;
  }
  
  export interface CreateRoleResponse {
    data: Role;
    success: boolean;
  }

  export interface Department {
    id: number;
    name: string;
    description: string;
    status: boolean;
  }
  
  export interface DepartmentResponse {
    data: Department[];
    success: boolean;
    is_active: boolean;


  }

  export interface CreateDepartmentRequest {
    name: string;
    description: string;
  }
  
  export interface CreateDepartmentResponse {
    data: Department;
    success: boolean;
  }