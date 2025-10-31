import { api } from './EventServices';
import { employeeService } from './employeeService';
import { ApiEmployee, EmployeeResponse } from '@/types/employee';

export interface ClearanceRequestPayload {
  request_title: string;
  description: string;
  requester_id: number;
}

export interface ClearanceRequestResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface ClearanceFile {
  id: number;
  clearance_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: string;
}

export interface ClearanceRequest {
  id: number;
  request_title: string;
  created_by_id: number;
  created_by: ApiEmployee;
  requester_id: number;
  requester: ApiEmployee;
  requester_name: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  files: ClearanceFile[];
  created_at: string;
  parent_id: number | null;
  token: string;
  token_expires: string;
}

export interface ClearanceRequestsListResponse {
  response: {
    data: ClearanceRequest[];
    limit: number;
    page: number;
    total_clearance: number;
    total_pages: number;
  };
  success: boolean;
}

export interface ClearanceResponse {
  id: number;
  clearance_id: number;
  clearance: ClearanceRequest;
  created_at: string;
  created_by: number;
  employee: ApiEmployee;
  response: string;
  approve: boolean;
}

export interface ClearanceDetailData {
  clearance: {
    clearance: ClearanceRequest;
    rerequests: ClearanceRequest[];
  };
  responses: ClearanceResponse[];
}

export interface ClearanceDetailResponse {
  response: {
    data: ClearanceDetailData;
  };
  success: boolean;
}

export interface ClearanceActionPayload {
  response: string;
  approve: boolean;
}

export interface ReRequestPayload {
  description: string;
}

class ClearanceService {
  // Helper method to get user ID from localStorage
  private getUserId(): number {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
      throw new Error('User not found in localStorage');
    } catch (error) {
      console.error('Error getting user ID from localStorage:', error);
      throw new Error('User authentication required');
    }
  }

  async getEmployees(): Promise<ApiEmployee[]> {
    try {
      const response = await employeeService.getEmployees();
      
      if (response.success && response.response) {
        return response.response.data;
      }
      throw new Error('Failed to fetch employees');
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  async getClearanceRequests(page: number = 1, limit: number = 10, filterType?: 'to-me' | 'by-me', status?: string): Promise<ClearanceRequest[]> {
    try {
      const userId = this.getUserId();
      let url: string;
      
      // Use the new backend endpoints
      if (filterType === 'to-me') {
        // Assigned to me (To Me)
        url = `/staff/${userId}/clearance/assigned?page=${page}&limit=${limit}`;
      } else if (filterType === 'by-me') {
        // Created by me (By Me)
        url = `/staff/${userId}/clearance/created?page=${page}&limit=${limit}`;
      } else {
        // Default to all requests (fallback)
        url = `/staff/${userId}/clearance?page=${page}&limit=${limit}`;
      }
      
      // Add status filter if provided
      if (status) {
        url += `&status=${status}`;
      }
      
      console.log('Get clearance requests API URL:', url);
      
      const response = await api.getEvents(url);
      
      console.log('Get clearance requests API response:', response);
      console.log('Response data:', response.data);
      
      const result = response.data as ClearanceRequestsListResponse;
      
      console.log('Clearance requests result:', result);
      console.log('Result success:', result.success);
      console.log('Result response:', result.response);
      console.log('Result response data:', result.response?.data);
      
      if (result.success && result.response && result.response.data) {
        console.log('Returning clearance requests:', result.response.data);
        return result.response.data;
      }
      
      console.error('Failed to fetch clearance requests - result:', result);
      throw new Error('Failed to fetch clearance requests');
    } catch (error) {
      console.error('Error fetching clearance requests:', error);
      throw error;
    }
  }

  async createClearanceRequest(
    payload: ClearanceRequestPayload,
    files?: FileList | null
  ): Promise<ClearanceRequestResponse> {
    try {
      const userId = this.getUserId();
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add the JSON payload as a string
      formData.append('data', JSON.stringify(payload));
      
      // Add files if any
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          formData.append('files', file);
        });
      }
      
      const response = await api.postEvents(`/staff/${userId}/clearance`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      // Return the full response data instead of response.response
      return response.data as ClearanceRequestResponse;
    } catch (error) {
      console.error('Error creating clearance request:', error);
      throw error;
    }
  }

  async getClearanceDetail(clearanceId: string): Promise<ClearanceDetailData> {
    try {
      const userId = this.getUserId();
      const response = await api.getEvents(`/staff/${userId}/clearance/${clearanceId}/view`);
      
      console.log('Clearance detail API response:', response);
      console.log('Response data:', response.data);
      
      // The API response structure is: { response: { data: { clearance: {...}, responses: [...] } }, success: true }
      const result = response.data as ClearanceDetailResponse;
      
      if (result.success && result.response) {
        // The API returns { response: { data: { clearance: {...}, responses: [...] } } }
        // But our interface expects { clearance: {...}, responses: [...] }
        // So we need to return result.response.data
        console.log('Returning clearance detail data:', result.response.data);
        return result.response.data;
      }
      throw new Error('Failed to fetch clearance details');
    } catch (error) {
      console.error('Error fetching clearance details:', error);
      throw error;
    }
  }

  async submitClearanceResponse(
    clearanceId: string,
    payload: ClearanceActionPayload,
    files?: FileList | null
  ): Promise<ClearanceRequestResponse> {
    try {
      const userId = this.getUserId();
      
      // Create FormData for the request
      const formData = new FormData();
      
      // Add the JSON payload as a string in the 'data' field
      formData.append('data', JSON.stringify(payload));
      
      // Add files if any
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          formData.append('files', file);
        });
      }
      
      const response = await api.postEvents(`/staff/${userId}/clearance/${clearanceId}/reply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data as ClearanceRequestResponse;
    } catch (error) {
      console.error('Error submitting clearance response:', error);
      throw error;
    }
  }

  async createReRequest(
    clearanceId: string,
    payload: ReRequestPayload
  ): Promise<ClearanceRequestResponse> {
    try {
      const userId = this.getUserId();
      const response = await api.postEvents(`/staff/${userId}/clearance/${clearanceId}/Re-request`, payload);
      
      return response.data as ClearanceRequestResponse;
    } catch (error) {
      console.error('Error creating re-request:', error);
      throw error;
    }
  }
}

export const clearanceService = new ClearanceService();
