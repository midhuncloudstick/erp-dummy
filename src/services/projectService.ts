import { api } from './EventServices';

export interface ProjectAssignee {
  employee_id: number;
}

export interface CreateProjectRequest {
  project_name: string;
  lead_id: string;
  project_description: string;
  start_date: string;
  end_date: string;
  project_cost: number;
  status: string;
  priority: string;
  demo_url?: string;
  assigned_hours: number;
  project_manager_id: number;
  assignees: ProjectAssignee[];
}

export interface CreateProjectResponse {
  data: any;
  success: boolean;
  message?: string;
}

export interface ApiProject {
  id: number;
  project_name: string;
  lead_id: string;
  lead: {
    id: string;
    customer: {
      id: number;
      full_name: string;
      company_name: string;
      email: string;
      phone_number: string;
    };
  };
  project_description: string;
  start_date: string;
  end_date: string;
  project_cost: number;
  status: string;
  priority: string;
  demo_url: string;
  assigned_hours: number;
  project_manager_id: number;
  project_manager: any;
  assignees: any;
  project_files: any;
}

export interface ProjectsResponse {
  response: {
    data: ApiProject[];
    limit: number;
    page: number;
    total_count: number;
    total_pages: number;
  };
  success: boolean;
}

export interface ProjectAssignee {
  project_id: number;
  employee_id: number;
  employee: {
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
    salary: string;
    employment_type: string;
  };
}

export interface DetailedProject {
  id: number;
  project_name: string;
  lead_id: string;
  lead: {
    id: string;
    customer_id: number;
    customer: {
      id: number;
      full_name: string;
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
      industry: {
        id: number;
        industry_name: string;
        description: string;
      };
    };
    product_id: number;
    product: {
      id: number;
      product_name: string;
      description: string;
    };
    middleman_id: number;
    middleman: {
      id: number;
      full_name: string;
      phone_number: string;
      email: string;
      address: string;
    };
    description: string;
    estimated_cost: number;
    employees: any[];
    notes: Array<{
      id: number;
      lead_id: string;
      note: string;
      date: string;
    }>;
    reminder: Array<{
      id: number;
      lead_id: string;
      date: string;
      description: string;
    }>;
    to_do_list: any[];
    attachments: any[];
    status: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    industry: string;
    location: string;
  };
  project_description: string;
  start_date: string;
  end_date: string;
  project_cost: number;
  status: string;
  priority: string;
  demo_url: string;
  assigned_hours: number;
  project_manager_id: number;
  project_manager: {
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
    salary: string;
    employment_type: string;
  };
  assignees: ProjectAssignee[];
  project_files: any[];
}

export interface ProjectDetailResponse {
  data: DetailedProject;
  success: boolean;
}

export const projectService = {
  async createProject(employeeId: number, projectData: CreateProjectRequest): Promise<CreateProjectResponse> {
    // Create FormData and add the JSON payload as a string in 'data' field
    const formData = new FormData();
    formData.append('data', JSON.stringify(projectData));
    
    const response = await api.postEvents(`/employee/${employeeId}/project`, formData);
    return response.data;
  },

  async getProjects(
    employeeId: number, 
    params?: {
      search?: string;
      project_name?: string;
      lead_id?: string;
      status?: string;
      priority?: string;
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ProjectsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `/employee/${employeeId}/project${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.getEvents(url);
    return response.data;
  },

  async getProjectById(employeeId: number, projectId: number): Promise<ProjectDetailResponse> {
    const url = `/employee/${employeeId}/project/${projectId}`;
    const response = await api.getEvents(url);
    return response.data;
  },

  async updateProjectStatus(employeeId: number, projectId: number, status: string): Promise<any> {
    const response = await api.patchEvent(`/employee/${employeeId}/project/${projectId}/status?status=${encodeURIComponent(status)}`, {});
    return response.data;
  },

  async updateProject(employeeId: number, projectId: number, projectData: any): Promise<CreateProjectResponse> {
    const response = await api.patchEvent(`/employee/${employeeId}/project/${projectId}`, projectData);
    return response.data;
  },

  async deleteProject(employeeId: number, projectId: number): Promise<{ success: boolean; message?: string }> {
    const response = await api.deleteEvents(`/employee/${employeeId}/project/${projectId}`);
    return response.data;
  }
};
