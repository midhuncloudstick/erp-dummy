import { api } from "./EventServices";  
import { Department, CreateDepartmentRequest } from "@/types/role";

export const departmentService = {
  async listDepartments(isActive: boolean = true) {
    const res = await api.getEvents(`/department`);
    return res.data.response.data;
  },
};

export const createDepartment = async (payload: CreateDepartmentRequest) => {
  const res = await api.postEvents(`/department`, payload);
  return res.data;
};

export const updateDepartment = async (id: number, payload: CreateDepartmentRequest) => {
  const res = await api.patchEvent(`/department/${id}`, payload);
  return res.data;
};

export const deleteDepartment = async (id: number) => {
  const res = await api.deleteEvents(`/department/${id}`);
  return res.data;
};