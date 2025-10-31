import { api } from "./EventServices"; 
import   { TodoItem }  from "../store/slices/todoListSlice";  // adjust path if needed
// Define response types
export interface TodoResponse {
  response: TodoItem[];
  success: boolean;
}

export interface CreateTodoResponse {
  response: TodoItem;
  success: boolean;
}

export interface Company {
  id: number;
  company_name: string;
  legal_structure: string;
  register_number: string;
  gst_number: string;
  industry_type: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_active: boolean;
  company_default: boolean;
  created_at: string; // ISO timestamp
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

export interface Employee {
  id: number;
  profile_pic: string;
  full_name: string;
  company_id: number;
  company_name: string;
  company: Company;
  role_id: number;
  role_name: string;
  role: Role;
  department_id: number;
  department_name: string;
  department: Department;
  email: string;
  phone_number: string;
  address: string;
  is_active: boolean;
  join_date: string;    // ISO timestamp
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
  DeletedAt: string | null;
}

export interface EmployeeListResponse {
  response: {
    data: Employee[];
    limit: number;
    page: number;
    total_pages: number;
  };
  success: boolean;
}

// export interface
export const todoService = {
  async getTodos(userId:number): Promise<TodoResponse> {
    const response = await api.getEvents(`/staff/${userId}/todo/created`);
    return response.data;
  },
// async getTodosByStatus({ status }: { status: "Overdue" | "pending" | "completed" }): Promise<TodoResponse> {
//   const response = await api.getEvents(`/todo?status=${status}`);
//   return response.data;
// },
 
async getAssignedTodos(userId:number) :Promise<TodoResponse> {
  const response = await api.getEvents(`/staff/${userId}/todo/assigned`);
  return response.data
},

  async createTodo(newTodo: TodoItem,userId:number): Promise<CreateTodoResponse> {
    const response = await api.postEvents(`/staff/${userId}/todo`,newTodo);
    return response.data;
  },

  async AssignStaff(): Promise<EmployeeListResponse> {
    const response = await api.getEvents(`/employee`);
    return response.data;
  },
  
  async checkbox(userId: number, todoId: number): Promise<any> {
const response = await api.patchEvent(
  `/staff/${userId}/todo/${todoId}/complete`,
  {}
);
  console.log(response.data)
  return response.data;
  },



 async getCompleteTodo(userId:number,): Promise<any> {
  const response = await api.getEvents(
    `/staff/${userId}/todo/completed`);
    return response.data;
 },  

async StatusTodo(userId:number): Promise<any> {
const response = await api.getEvents(`/staff/${userId}/todo/statusLog`);
  // console.log(response.data)
  return response.data;
},


async StaffView(userId:number):Promise<any>{
  const response=await api.getEvents(`/todo/staff/${userId}`)
  return response.data
},

async CompletetoPending(userId:number,todoId:number):Promise<any>{
  const response=await api.patchEvent(`/staff/${userId}/todo/${todoId}/Incomplete`,{})
  return response.data
},


  async updateTodo(
    userId:number,
    id: string,
    updatedTodo: Partial<TodoItem>
  ): Promise<CreateTodoResponse> {
    const response = await api.patchEvent(`/staff/${userId}/todo/${id}/update`,updatedTodo);
    return response.data;
  },

  async deleteTodo(userId:number,id: string): Promise<{ success: boolean }> {
    const response = await api.deleteEvents(`staff/${userId}/todo/${id}/delete`);
    return response.data;
  },

  async toggleTodoStatus(
    id: string
  ): Promise<{ data: TodoItem; success: boolean }> {
    const response = await api.putEvent(`/todo/${id}/toggle-status`, {});
    return response.data;
  },
};


