// src/store/roleSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { roleService, RolePayload } from "@/services/roleService";
import { Department, CreateDepartmentRequest } from "@/types/role";
import { departmentService, createDepartment as createDepartmentService, updateDepartment as updateDepartmentService, deleteDepartment as deleteDepartmentService } from "@/services/departmentService";

export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface RoleState {
  roles: Role[];
  departments: Department[];
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  departments: [],
  loading: false,
  error: null,
};

interface DepartmentState {
  departments: Department[];
  loading: boolean;
  error: string | null;
}

const initialDepartmentState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
};

// ✅ Thunks
export const fetchRoles = createAsyncThunk("roles/fetchAll", async () => {
  const res = await roleService.listRoles(true);
  return res as Role[];
});

export const createRole = createAsyncThunk(
  "roles/create",
  async (payload: RolePayload, { rejectWithValue }) => {
    try {
      const res = await roleService.createRole(payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Create failed");
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/update",
  async ({ id, payload }: { id: number; payload: RolePayload }, { rejectWithValue }) => {
    try {
      const res = await roleService.updateRole(id, payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update failed");
    }
  }
);

export const deleteRole = createAsyncThunk(
  "roles/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await roleService.deleteRole(id);
      return { id, ...res };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Delete failed");
    }
  }
);

export const fetchDepartments = createAsyncThunk("departments/fetchAll", async () => {
  const res = await departmentService.listDepartments(true);
  return res as Department[];
});

export const createDepartment = createAsyncThunk(
  "departments/create",
  async (payload: CreateDepartmentRequest, { rejectWithValue }) => {
    try {
      const res = await createDepartmentService(payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Create failed");
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "departments/update",
  async ({ id, payload }: { id: number; payload: CreateDepartmentRequest }, { rejectWithValue }) => {
    try {
      const res = await updateDepartmentService(id, payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update failed");
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  "departments/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await deleteDepartmentService(id);
      return { id, ...res };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Delete failed");
    }
  }
);
 
// ✅ Slice
const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create role
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })

      // Update role
      .addCase(updateRole.fulfilled, (state, action) => {
        const idx = state.roles.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.roles[idx] = action.payload;
      })

      // Delete role
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload.id);
      });

    builder
      // Fetch departments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      // Create department
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const idx = state.departments.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.departments[idx] = action.payload;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((d) => d.id !== action.payload.id);
      });
    
  },
});

export default roleSlice.reducer;
