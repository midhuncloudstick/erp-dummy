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