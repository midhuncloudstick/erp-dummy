import { api } from './EventServices';

export type MissionPriority = 'high' | 'medium' | 'low';
export type MissionProgress = 'created' | 'in_progress' | 'completed';

export interface Staff {
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

export interface ImportantMission {
  id: number;
  title: string;
  description: string;
  priority: MissionPriority;
  progress: MissionProgress;
  created_at?: string;
  completed_at?: string | null;
  created_by_id?: number;
  created_by?: Staff;
  staff_id?: number;
  staff?: Staff;
}

export interface ListImportantMissionsResponse {
  
 response :{
    data: ImportantMission[];
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
  success: boolean;
}

export interface CreateImportantMissionRequest {
  title: string;
  description: string;
  priority: MissionPriority;
}

export interface CreateImportantMissionResponse {
  response: ImportantMission;
  success: boolean;
  message?: string;
}

export const missionService = {
  async getImportantMissions(staffId: number): Promise<ListImportantMissionsResponse> {
    const res = await api.getEvents(`/staff/${staffId}/important_mission`);
    return res.data as ListImportantMissionsResponse;
  },

  async createImportantMission(
    staffId: number,
    payload: CreateImportantMissionRequest
  ): Promise<CreateImportantMissionResponse> {
    const res = await api.postEvents(`/staff/${staffId}/important_mission`, payload);
    return res.data as CreateImportantMissionResponse;
  },

  async deleteImportantMission(
    staffId: number,
    missionId: number | string
  ): Promise<{ success?: boolean; message?: string }> {
    const res = await api.deleteEvents(`/staff/${staffId}/important_mission/${missionId}`);
    return res.data as { success?: boolean; message?: string };
  },

  async updateImportantMissionProgress(
    staffId: number,
    missionId: number | string,
    progress: MissionProgress
  ): Promise<{ data?: string; success?: boolean; message?: string }> {
    console.log('Sending progress update:', { staffId, missionId, progress });
    
    // Try sending as query parameter instead of body
    const res = await api.patchEvent(
      `/staff/${staffId}/important_mission/${missionId}/progress?progress=${progress}`,
      {}
    );
    
    console.log('Progress update response:', res.data);
    return res.data as { data?: string; success?: boolean; message?: string };
  },
};
