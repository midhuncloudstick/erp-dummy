import { api } from './EventServices';

export interface ProjectUpdateFile {
  id: number;
  project_update_id: number;
  file_name: string;
  file_size: string;
  file_path: string;
  file_type: string;
}

export interface ApiProjectUpdate {
  id: number;
  project_id: number;
  title: string;
  description: string;
  created_at: string;
  files: ProjectUpdateFile[];
}

export interface ProjectUpdatesResponse {
  data: ApiProjectUpdate[];
  success: boolean;
  message?: string;
}

export interface CreateProjectUpdateRequest {
  title: string;
  description: string;
}

export interface CreateProjectUpdateResponse {
  data: ApiProjectUpdate;
  success: boolean;
  message?: string;
}

// Task Update Types
export interface TaskUpdateFile {
  id: number;
  task_update_id: number;
  file_name: string;
  file_size: string;
  file_path: string;
  file_type: string;
}

export interface ApiTaskUpdate {
  id: number;
  task_id: number;
  title: string;
  description: string;
  created_at: string;
  files: TaskUpdateFile[];
}

export interface TaskUpdatesResponse {
  data: ApiTaskUpdate[];
  success: boolean;
  message?: string;
}

export interface CreateTaskUpdateRequest {
  title: string;
  description: string;
}

export interface CreateTaskUpdateResponse {
  data: ApiTaskUpdate;
  success: boolean;
  message?: string;
}

// Task History Types
export interface TaskHistory {
  id: number;
  task_id: number;
  employee_id: number;
  action: string;
  description: string;
  status: string;
  timestamp: string;
}

export interface TaskHistoryResponse {
  message: {
    data: TaskHistory[];
    limit: number;
    page: number;
    total_count: number;
    total_pages: number;
  };
  success: boolean;
}

// Project History Types
export interface ProjectHistory {
  id: number;
  project_id: number;
  employee_id: number;
  action: string;
  description: string;
  status: string;
  timestamp: string;
}

export interface ProjectHistoryResponse {
  message: {
    data: ProjectHistory[];
    limit: number;
    page: number;
    total_count: number;
    total_pages: number;
  };
  success: boolean;
}

export const projectUpdatesService = {
  async getProjectUpdates(employeeId: number, projectId: number): Promise<ProjectUpdatesResponse> {
    const response = await api.getEvents(`/employee/${employeeId}/project/${projectId}/project_updates`);
    return response.data;
  },

  async createProjectUpdate(
    employeeId: number, 
    projectId: number, 
    updateData: CreateProjectUpdateRequest,
    files?: File[]
  ): Promise<CreateProjectUpdateResponse> {
    const formData = new FormData();
    
    // Add the JSON data as a string in the 'data' field
    formData.append('data', JSON.stringify(updateData));
    
    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    const response = await api.postEvents(`/employee/${employeeId}/project/${projectId}/project_updates`, formData);
    return response.data;
  },

  async deleteProjectUpdate(employeeId: number, projectId: number, updateId: number): Promise<{ success: boolean; message?: string }> {
    const response = await api.deleteEvents(`/employee/${employeeId}/project/${projectId}/project_updates/${updateId}`);
    return response.data;
  },

  // Task Updates Methods
  async getTaskUpdates(employeeId: number, projectId: number, taskId: number): Promise<TaskUpdatesResponse> {
    const endpoint = `/employee/${employeeId}/project/${projectId}/task/${taskId}/task_updates`;
    // console.log('API call to:', endpoint);
    const response = await api.getEvents(`/employee/${employeeId}/project/${projectId}/task/${taskId}/task_updates`);
    console.log('API response:', response);
    return response.data;
  },

  async createTaskUpdate(
    employeeId: number, 
    projectId: number, 
    taskId: number,
    updateData: CreateTaskUpdateRequest,
    files?: File[]
  ): Promise<CreateTaskUpdateResponse> {
    const formData = new FormData();
    
    // Add the JSON data as a string in the 'data' field
    formData.append('data', JSON.stringify(updateData));
    
    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    const response = await api.postEvents(`/employee/${employeeId}/project/${projectId}/task/${taskId}/task_updates`, formData);
    return response.data;
  },

  async deleteTaskUpdate(employeeId: number, projectId: number, taskId: number, updateId: number): Promise<{ success: boolean; message?: string }> {
    const response = await api.deleteEvents(`/employee/${employeeId}/project/${projectId}/task/${taskId}/task_updates/${updateId}`);
    return response.data;
  },

  // Task History Methods
  async getTaskHistory(employeeId: number, projectId: number, taskId: number): Promise<TaskHistoryResponse> {
    const endpoint = `/employee/${employeeId}/project/${projectId}/task/${taskId}/task_histories`;
    console.log('API call to task history:', endpoint);
    const response = await api.getEvents(endpoint);
    console.log('Task history response:', response);
    return response.data;
  },

  // Project History Methods
  async getProjectHistory(employeeId: number, projectId: number): Promise<ProjectHistoryResponse> {
    const endpoint = `/employee/${employeeId}/project/${projectId}/project_histories`;
    console.log('API call to project history:', endpoint);
    const response = await api.getEvents(endpoint);
    console.log('Project history response:', response);
    return response.data;
  }
};
