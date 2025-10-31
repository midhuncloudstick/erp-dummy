import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import { User, LoginRequest, RegisterRequest, LoginResponse } from '@/types/auth';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.response));
      return response;
    } catch (error: any) {
      // Handle axios errors properly
      if (error.response?.data?.error) {
        // API returned an error message
        return rejectWithValue(error.response.data.error);
      } else if (error.response?.data?.message) {
        // API returned a message field
        return rejectWithValue(error.response.data.message);
      } else if (error.message) {
        // Network or other error
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('Failed to login');
      }
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userInfo: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(userInfo);
      return response;
    } catch (error: any) {
      // Handle axios errors properly
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      } else if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (error.message) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('Failed to register');
      }
    }
  }
);

interface AuthState {
  user: User | null;
  token: string | null;
  userType: 'customer' | 'admin' | null;
  loading: boolean;
  error: string | null;
}

const getInitialUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const getInitialUserType = (): 'customer' | 'admin' | null => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  const parsedUser = JSON.parse(user) as User;
  return parsedUser.userType || null;
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: localStorage.getItem('token'),
  userType: getInitialUserType(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userType = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser:(state,action)=>{
      console.log("updateData",action.payload.payload)
     state.user=action.payload.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        console.log("dadadad",action.payload)
        state.user = action.payload.response;
        // state.token = action.payload.token;
        state.userType = action.payload.response.userType;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError ,updateUser } = authSlice.actions;
export default authSlice.reducer;
