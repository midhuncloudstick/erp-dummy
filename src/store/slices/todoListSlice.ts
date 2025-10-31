import { Employee, todoService } from "@/services/todoService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

// ---------------------- Interfaces ----------------------
export interface TodoItem {
  id?: number;
  task_title: string;
  description?: string;
  status?: "Created" | "Pending" | "Completed" | "Overdue" | "";
  task_type: "OneTime" | "Recurring";
  due_date?: string | null;
  recurring_frequency?: string | null;
  next_due_date: string | null;
  time_of_day?: string | null;
  day_of_week?: string | null;
  day_of_month?: number | null;
  month_of_year?: string | null;
  assign_to_staff?: number | null;
  created_at?: string | null;
  created_by?:number | null;
  creator_name?: string | null;
}

export interface StaffOption {
  id: number;
  full_name: string;
  role_name: string;
}

export interface StatusLogEntry {
  id: number;
  todo_task_id: number;
  changed_by_id: number;
  employee: Employee;
  status?: "Pending" | "Completed" | "Created" | "Overdue";
  changed_at: string;
}

export interface StaffViewItem {
  id: number;
  todo_id: number;
  todo_title: string;
  description: string;
  assigned_date: string;
  due_date: string;
  status: "Overdue" | "Pending" | "Completed";
}

export interface UpdateTodoPayload {
  userId: number;
  id: string;
  updatedTodo: Partial<TodoItem>;
}

interface TodoListState {
  items: TodoItem[];
  completed: TodoItem[];
  assignedTodos: TodoItem[];
  assignedStaff?: StaffOption[];
  statusLog: StatusLogEntry[];
  staffViewItems: StaffViewItem[];
  loading: boolean;
  error: string | null;
}

// ---------------------- Initial State ----------------------
const initialState: TodoListState = {
  items: [],
  assignedStaff: [],
  assignedTodos: [],
  completed: [],
  statusLog: [],
  staffViewItems: [],
  loading: false,
  error: null,
};
// ---------------------- Async Thunks ----------------------


export const fetchTodoList = createAsyncThunk<TodoItem[], void>(
  "todoList/fetch",
  async (_, { rejectWithValue }) => {
    try {
     const user = JSON.parse(localStorage.getItem("user") || "{}");
       const userId = user?.id;
     
      const response = await todoService.getTodos(userId);
        console.log("listssssssss",response.response.data)
      return response.response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch todos"
      );
    }
  }
);


export const fetchAssignedTodoList = createAsyncThunk(
  "AssignedtodoList/fetch",
  async(_,{rejectWithValue})=>{
    try{
      const user= JSON.parse(localStorage.getItem("user") || "{}");
      console.log("fetching assigneeeeee!!!!!!!");
      
      const userId = user?.id;
      const response = await todoService.getAssignedTodos(userId);
      console.log('ccxxxxxxxxxx',response.response.data)
      return response.response;
   
    }catch(error){
      return rejectWithValue(
        error instanceof Error ? error.message :"failed to fetch assigned todos"
      )
    }
  }
)



export const createTodo = createAsyncThunk<TodoItem, TodoItem>(
  "todoList/create",
  async (newTodo, { rejectWithValue }) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.id;
      const response = await todoService.createTodo(newTodo,userId);
      return response.response;
    } catch (error){
      if (error.response && error.response.data) {
        // console.log("Error inslice",error.response)
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const GetAssignStaff = createAsyncThunk<StaffOption[]>(
  "todoList/getAssignStaff",
  async (_, { rejectWithValue }) => {
    try {
      const response = await todoService.AssignStaff();
      return response.response.data.map(
        (staff: { id: number; full_name: string; role_name: string }) => ({
          id: staff.id,
          full_name: staff.full_name,
          role_name: staff.role_name,
        })
      );
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch assigned staff");
    }
  }
);


export const toggleTodoStatus = createAsyncThunk<TodoItem, { userId: number; todoId: number }>(
  "todoList/toggleStatus",
  async ({ userId, todoId }, { rejectWithValue }) => {
    try {
      const updatedTodo = await todoService.checkbox(userId, todoId);
      return updatedTodo;
    } catch (error) {
      return rejectWithValue("Failed to toggle todo");
    }
  }
);


export const fetchCompletedTodos = createAsyncThunk(
  "CompletedTodoList",
  async(_, {rejectWithValue}) =>{
    try{
        const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.id;
      const response = await todoService.getCompleteTodo(userId);
      console.log("completedTovvvvvvvvvvvvvvvvvvvvvvvvvvvdos",response.response)
      return response.response;

    }
    catch(error){
      return rejectWithValue("Failed to fetch Completed Todos")
    }
  }
);

export const TodostatusLogg = createAsyncThunk<StatusLogEntry[]>(
  "todoList/statusLog",
  async (_, { rejectWithValue }) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.id;
      const response = await todoService.StatusTodo(userId);
      return response.data; // assuming API returns array of logs
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch status logs");
    }
  }
);

export const deleteTodo = createAsyncThunk<string, number>(
  "todoList/delete",
  async (id, { rejectWithValue }) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.id;
      await todoService.deleteTodo(userId,id.toString());
      return `Todo with ID ${id} deleted successfully.`;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete todo"
      );
    }
  }
);

// ... inside your async thunks section
export const toggleCompleteToPending = createAsyncThunk<TodoItem, { userId: number; todoId: number }>(
  "todoList/toggleCompleteToPending",
  async ({ userId, todoId }, { rejectWithValue }) => {
    try {
      const updatedTodo = await todoService.CompletetoPending(userId, todoId);
      // Assuming the API returns the updated todo item
      return updatedTodo.data;
    } catch (error) {
      return rejectWithValue("Failed to set todo to pending");
    }
  }
);
export const fetchStaffView = createAsyncThunk(
  'staffView/fetchStaffView',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await todoService.StaffView(userId);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const updateTodoList = createAsyncThunk<TodoItem, UpdateTodoPayload>(
  "todoList/update",
  async ({ userId, id ,updatedTodo }, { rejectWithValue }) => {
    try {
      // const user = JSON.parse(localStorage.getItem("user") || "{}");
      // const userId = user?.id;
      // // The service call is handled here
      
      const response = await todoService.updateTodo(userId, id, updatedTodo);
      toast.success("Task updated successfully.");
      return response.response; // Assumes the service returns the updated TodoItem
    } catch (error: any) {
      toast.error("Failed to update task.");
      return rejectWithValue(error.response?.data || "Failed to update todo");
    }
  }
);



// ---------------------- Slice ----------------------
const determineStatus = (todo: TodoItem): "Created" | "Pending" | "Completed" | "Overdue" | "" => {
  if (todo.status === "Completed") return "Completed";

  const dateStr = todo.task_type === "Recurring" ? (todo as any).next_due_date : todo.due_date;
  if (!dateStr) return "Pending";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 

  const dueDateObj = new Date(dateStr);
  const dueDate = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());
  if (dueDate > today) return "Created";    
  if (dueDate < today) return "Overdue";    
  return "Pending";                        

}

const createTodoListSlice = createSlice({
name: "TodoList",
initialState,
reducers: {
addTodo: (state, action: PayloadAction<TodoItem>) => {
state.items.push(action.payload);
},
removeTodo: (state, action: PayloadAction<number>) => {
state.items = state.items.filter((todo) => todo.id !== action.payload);
state.completed = state.completed.filter((todo) => todo.id !== action.payload);
},
updateTodo: (state, action: PayloadAction<TodoItem>) => {
const index = state.items.findIndex((todo) => todo.id === action.payload.id);
if (index !== -1) state.items[index] = action.payload;


const completedIndex = state.completed.findIndex((todo) => todo.id === action.payload.id);
if (completedIndex !== -1 && action.payload.status === "Completed") state.completed[completedIndex] = action.payload;
},
},
extraReducers: (builder) => {
builder
.addCase(fetchTodoList.fulfilled, (state, action) => {
  state.loading = false;
  state.items = action.payload.data;
  console.log("Itemssssss",state.items)

  // Update completed
  // state.completed = state.items.filter(todo => todo.status === "Completed");

  // Update assignedTodos
  //state.assignedTodos = state.items.filter(todo => todo.assign_to_staff !== null); 
})
.addCase(fetchTodoList.rejected, (state, action) => {
state.loading = false;
state.error = action.error.message || "Failed to fetch todo list";
})


// Fetch Assigned Todos
.addCase(fetchAssignedTodoList.pending, (state) => { state.loading = true; state.error = null; })
.addCase(fetchAssignedTodoList.fulfilled, (state, action) => {
state.loading = false;
state.assignedTodos = action.payload.data
})

.addCase(fetchAssignedTodoList.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch assigned todos"; })


// Fetch Completed Todos
.addCase(fetchCompletedTodos.pending, (state) => { state.loading = true; state.error = null; })
.addCase(fetchCompletedTodos.fulfilled, (state, action) => {
state.loading = false;
state.completed = action.payload.data;
})
.addCase(fetchCompletedTodos.rejected, (state, action) => { state.loading = false; state.error = action.payload as string || "Failed to fetch completed todos"; })


// Create Todo
.addCase(createTodo.fulfilled, (state, action) => {
  state.loading = false;
  state.items.push(action.payload);   
  
})
// Get Assigned Staff
.addCase(GetAssignStaff.fulfilled, (state, action) => {
  state.assignedStaff = action.payload; // Keep exactly as it was
})



// Toggle Todo Status
.addCase(toggleTodoStatus.fulfilled, (state, action) => {
  const updatedTodo = action.payload;

  // Update items
  const index = state.items.findIndex(t => t.id === updatedTodo.id);
  if (index !== -1) state.items[index] = { ...state.items[index], ...updatedTodo };

  // Update completed array
  state.completed = state.items.filter(todo => todo.status === "Completed");

  // Update assignedTodos array
  const assignedIndex = state.assignedTodos.findIndex(t => t.id === updatedTodo.id);
  if (assignedIndex !== -1) state.assignedTodos[assignedIndex] = { ...state.assignedTodos[assignedIndex], ...updatedTodo };

  state.loading = false;
})



// Toggle Complete to Pending
.addCase(toggleCompleteToPending.fulfilled, (state, action) => {
const updatedTodo = action.payload;
const index = state.items.findIndex(t => t.id === updatedTodo.id);
if (index !== -1) state.items[index] = { ...state.items[index], ...updatedTodo };
state.completed = state.completed.filter(todo => todo.id !== updatedTodo.id);
//state.assignedTodos = state.assignedTodos.filter(todo => todo.id !== updatedTodo.id);
state.loading = false;
})


// Status Log
.addCase(TodostatusLogg.pending, (state) => { state.loading = true; })
.addCase(TodostatusLogg.fulfilled, (state, action) => { state.loading = false; state.statusLog = action.payload; })
.addCase(TodostatusLogg.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch status logs"; })


// Delete Todo
.addCase(deleteTodo.fulfilled, (state, action) => {
  const deletedTodoId = action.meta.arg;
  state.items = state.items.filter(todo => todo.id !== deletedTodoId);
  state.completed = state.completed.filter(todo => todo.id !== deletedTodoId);
  //state.assignedTodos = state.assignedTodos.filter(todo => todo.id !== deletedTodoId);
  state.loading = false;
})

.addCase(deleteTodo.pending, (state) => { state.loading = true; })
.addCase(deleteTodo.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })


// Staff View (kept intact)
.addCase(fetchStaffView.pending, (state) => { state.loading = true; state.error = null; })
.addCase(fetchStaffView.fulfilled, (state, action) => { state.loading = false; state.staffViewItems = action.payload; })
.addCase(fetchStaffView.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })


// Update Todo
.addCase(updateTodoList.pending, (state) => { state.loading = true; state.error = null; })
.addCase(updateTodoList.fulfilled, (state, action) => {
state.loading = false;
const index = state.items.findIndex(item => item.id === action.payload.id);
if (index !== -1) state.items[index] = action.payload;
if (action.payload.status === "Completed") {
const exists = state.completed.find(todo => todo.id === action.payload.id);
if (!exists) state.completed.push(action.payload);
}
})
.addCase(updateTodoList.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
},
});


export const { addTodo, removeTodo, updateTodo } = createTodoListSlice.actions;
export default createTodoListSlice.reducer;