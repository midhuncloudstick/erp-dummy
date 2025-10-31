import { api } from './EventServices';

export interface CustomField {
  id?: number;
  task_id?: number;
  field_name: string;
  field_type: 'text' | 'number' | 'date' | 'boolean';
  value: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReportsTo {
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
  created_at: string;
  updated_at: string;
  salary: string;
  employment_type: string;
}

export interface ApiTask {
  id: number;
  project_id: number;
  name: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Reviewed' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  start_date: string;
  end_date: string;
  assigned_hours: number;
  progress: number;
  tracked_hours: number;
  reports_to_id: number;
  reports_to: ReportsTo;
  custom_fields: CustomField[];
}

export interface TasksResponse {
  message: {
    data: ApiTask[];
    limit: number;
    page: number;
    total_count: number;
    total_pages: number;
  };
  success: boolean;
}

export interface CreateTaskRequest {
  name: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Reviewed' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  start_date: string;
  end_date: string;
  assigned_hours: number;
  reports_to_id: number;
  custom_fields: Omit<CustomField, 'id' | 'task_id' | 'created_at' | 'updated_at'>[];
}

export interface CreateTaskResponse {
  data: ApiTask;
  success: boolean;
  message?: string;
}

export const taskService = {
  async getTasks(
    employeeId: number, 
    projectId: number,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      priority?: string;
    }
  ): Promise<TasksResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `/employee/${employeeId}/project/${projectId}/task${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.getEvents(url);
    return response.data;
  },

  async createTask(employeeId: number, projectId: number, taskData: CreateTaskRequest): Promise<CreateTaskResponse> {
    const response = await api.postEvents(`/employee/${employeeId}/project/${projectId}/task`, taskData);
    return response.data;
  },

  async updateTaskStatus(employeeId: number, projectId: number, taskId: number, status: string): Promise<any> {
    const response = await api.patchEvent(`/employee/${employeeId}/project/${projectId}/task/${taskId}/status`, { status });
    return response.data;
  },

  async updateTask(employeeId: number, projectId: number, taskId: number, taskData: Partial<CreateTaskRequest>): Promise<CreateTaskResponse> {
    const response = await api.patchEvent(`/employee/${employeeId}/project/${projectId}/task/${taskId}/update`, taskData);
    return response.data;
  },

  async getTaskById(employeeId: number, projectId: number, taskId: number): Promise<{ data: ApiTask; success: boolean; message?: string }> {
    const response = await api.getEvents(`/employee/${employeeId}/project/${projectId}/task/${taskId}`);
    return response.data;
  },

  async deleteTask(employeeId: number, projectId: number, taskId: number): Promise<{ success: boolean; message?: string }> {
    const response = await api.deleteEvents(`/employee/${employeeId}/project/${projectId}/task/${taskId}/delete`);
    return response.data;
  }
};
