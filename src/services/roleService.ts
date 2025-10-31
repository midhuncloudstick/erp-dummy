// src/services/roleService.ts
import { api } from "./EventServices";

export interface RolePayload {
  name: string;
  description: string;
  is_active?: boolean;
}

export const roleService = {
  async listRoles(isActive: boolean = true) {
    const res = await api.getEvents(`/role?is_active=${isActive}`);
    return res.data.response.data;
  },

  async createRole(payload: RolePayload) {
    const res = await api.postEvents(`/role`, payload);
    return res.data;
  },

  async updateRole(id: number, payload: RolePayload) {
    const res = await api.patchEvent(`/role/${id}`, payload);
    return res.data;
  },

  async deleteRole(id: number) {
    const res = await api.deleteEvents(`/role/${id}`);
    return res.data;
  },
};
