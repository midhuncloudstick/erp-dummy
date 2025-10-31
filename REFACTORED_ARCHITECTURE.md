# Refactored Architecture Documentation

## 🏗️ **New Architecture Overview**

This application has been refactored to follow your preferred pattern with:
- **Axios-based API client** with interceptors
- **Separated TypeScript interfaces** in dedicated type files
- **Centralized API services** with proper error handling
- **Redux Toolkit** for state management
- **Clean separation of concerns**

## 📁 **File Structure**

```
src/
├── types/
│   ├── TS-category.ts      # Category-related interfaces
│   └── TS-service.ts       # Service-related interfaces
├── services/
│   ├── TS-EventServices.ts # Axios-based API client
│   ├── categoryService.ts  # Category API calls
│   └── serviceService.ts   # Service API calls
├── store/
│   ├── index.ts           # Redux store configuration
│   ├── hooks.ts           # Typed Redux hooks
│   └── slices/
│       ├── categorySlice.ts # Category state management
│       └── serviceSlice.ts  # Service state management
└── pages/
    ├── CreateServicePage.tsx   # Service creation with API integration
    └── ServicesListPage.tsx    # Service listing with toggle functionality
```

## 🔧 **Key Components**

### **1. TypeScript Interfaces (`src/types/`)**

#### **TS-category.ts**
```typescript
export interface Category {
  id: number;
  category: string;
}

export interface CategoryResponse {
  data: Category[];
  success: boolean;
}

export interface CreateCategoryRequest {
  category: string;
}

export interface CreateCategoryResponse {
  data: Category;
  success: boolean;
}
```

#### **TS-service.ts**
```typescript
export interface Service {
  id: number;
  name: string;
  category_id: number;
  category: {
    id: number;
    category: string;
  };
  type: 'onetime' | 'recurring';
  monthly_cost?: string;
  yearly_cost?: string;
  one_time_cost?: string;
  features: string[];
  status: 'active' | 'inactive';
}

export interface ServiceResponse {
  message: {
    data: Service[];
    limit: number;
    page: number;
    total_count: number;
    total_pages: number;
  };
  success: boolean;
}

export interface CreateServiceRequest {
  name: string;
  type: 'onetime' | 'recurring';
  category_id: number;
  one_time_cost?: string;
  monthly_cost?: string;
  yearly_cost?: string;
  features: string[];
}

export interface ToggleStatusResponse {
  success: boolean;
  message?: string;
}
```

### **2. API Client (`src/services/TS-EventServices.ts`)**

```typescript
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

const apiUrl = "https://api.cloudhousetechnologies.com/api/v1";

const ApiClient: AxiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
});

// ✅ Request interceptor to always get the latest token
ApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Response interceptor
ApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.data.message === 'token expired' && error.config && !error.config.__isRetryRequest) {
      console.log('Error: token expired');
    }
    if (error.response?.status === 403) {
      console.log('Error: 403 Forbidden');
    }
    return Promise.reject(error);
  }
);

// ✅ API methods
const api = {
  getEvents(url: string) {
    return ApiClient.get(url);
  },
  postEvents(url: string, data: any, config?: AxiosRequestConfig) {
    return ApiClient.post(url, data, config);
  },
  deleteEvents(url: string) {
    return ApiClient.delete(url);
  },
  patchEvent(url: string, data: any, config?: AxiosRequestConfig) {
    return ApiClient.patch(url, data, config);
  },
  putEvent(url: string, data: any, config?: AxiosRequestConfig) {
    return ApiClient.put(url, data, config);
  },
};

export { ApiClient, api };
```

### **3. Service Layer (`src/services/`)**

#### **categoryService.ts**
```typescript
import { api } from './TS-EventServices';
import { 
  Category, 
  CategoryResponse, 
  CreateCategoryRequest, 
  CreateCategoryResponse 
} from '@/types/TS-category';

export const categoryService = {
  async getCategories(): Promise<CategoryResponse> {
    const response = await api.getEvents('/service/categories');
    return response.data;
  },

  async createCategory(categoryData: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const response = await api.postEvents('/service/categories', categoryData);
    return response.data;
  },

  async updateCategory(id: number, categoryData: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const response = await api.putEvent(`/service/categories/${id}`, categoryData);
    return response.data;
  },

  async deleteCategory(id: number): Promise<{ success: boolean }> {
    const response = await api.deleteEvents(`/service/categories/${id}`);
    return response.data;
  },
};
```

#### **serviceService.ts**
```typescript
import { api } from './TS-EventServices';
import { 
  Service, 
  ServiceResponse, 
  CreateServiceRequest, 
  CreateServiceResponse, 
  ToggleStatusResponse 
} from '@/types/TS-service';

export const serviceService = {
  async getServices(page: number = 1, limit: number = 10): Promise<ServiceResponse> {
    const response = await api.getEvents(`/services?page=${page}&limit=${limit}`);
    return response.data;
  },

  async createService(serviceData: CreateServiceRequest): Promise<CreateServiceResponse> {
    const response = await api.postEvents('/services', serviceData);
    return response.data;
  },

  async toggleServiceStatus(id: number): Promise<ToggleStatusResponse> {
    const response = await api.putEvent(`/services/${id}/toggle-status`, {});
    return response.data;
  },

  // ... other methods
};
```

### **4. Redux Store (`src/store/`)**

#### **Store Configuration (`index.ts`)**
```typescript
import { configureStore } from '@reduxjs/toolkit';
import categorySlice from './slices/categorySlice';
import serviceSlice from './slices/serviceSlice';

export const store = configureStore({
  reducer: {
    categories: categorySlice,
    services: serviceSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['categories/fetchCategories/pending', 'categories/fetchCategories/fulfilled', 'categories/fetchCategories/rejected'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### **Typed Hooks (`hooks.ts`)**
```typescript
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### **5. Redux Slices**

#### **categorySlice.ts**
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoryService } from '@/services/categoryService';
import { Category, CreateCategoryRequest } from '@/types/TS-category';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: CreateCategoryRequest, { rejectWithValue }) => {
    try {
      const response = await categoryService.createCategory(categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create category');
    }
  }
);

// ... slice implementation with proper state management
```

#### **serviceSlice.ts**
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { serviceService } from '@/services/serviceService';
import { Service, CreateServiceRequest } from '@/types/TS-service';

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await serviceService.getServices(page, limit);
      return response.message.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch services');
    }
  }
);

export const toggleServiceStatus = createAsyncThunk(
  'services/toggleServiceStatus',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await serviceService.toggleServiceStatus(id);
      return { id, success: response.success };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to toggle service status');
    }
  }
);

// ... slice implementation with proper state management
```

## 🚀 **API Endpoints Integration**

### **Categories**
- **GET** `/service/categories` - Fetch all categories
- **POST** `/service/categories` - Create new category
- **PUT** `/service/categories/:id` - Update category
- **DELETE** `/service/categories/:id` - Delete category

### **Services**
- **GET** `/services?page=1&limit=10` - Fetch services with pagination
- **POST** `/services` - Create new service
- **PUT** `/services/:id/toggle-status` - Toggle service status (enable/disable)
- **PUT** `/services/:id` - Update service
- **DELETE** `/services/:id` - Delete service

## 🎯 **Key Features**

### **1. Type Safety**
- ✅ All interfaces are properly typed
- ✅ Imported types throughout the application
- ✅ Compile-time error checking
- ✅ Better IDE support and autocomplete

### **2. API Integration**
- ✅ Axios-based client with interceptors
- ✅ Automatic token management
- ✅ Error handling with proper logging
- ✅ Request/response interceptors

### **3. State Management**
- ✅ Redux Toolkit with async thunks
- ✅ Proper loading states
- ✅ Error handling in state
- ✅ Optimistic updates for better UX

### **4. Component Integration**
- ✅ Typed Redux hooks (`useAppDispatch`, `useAppSelector`)
- ✅ Proper error handling with toast notifications
- ✅ Loading states for better UX
- ✅ Real-time updates

## 🔄 **Usage Examples**

### **Creating a Service**
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createService } from '@/store/slices/serviceSlice';

const dispatch = useAppDispatch();
const { creatingService } = useAppSelector((state) => state.services);

const handleCreateService = async (serviceData) => {
  const result = await dispatch(createService(serviceData));
  if (createService.fulfilled.match(result)) {
    toast.success('Service created successfully');
  }
};
```

### **Fetching Services**
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchServices } from '@/store/slices/serviceSlice';

const dispatch = useAppDispatch();
const { services, loading } = useAppSelector((state) => state.services);

useEffect(() => {
  dispatch(fetchServices({ page: 1, limit: 10 }));
}, [dispatch]);
```

### **Toggling Service Status**
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleServiceStatus } from '@/store/slices/serviceSlice';

const dispatch = useAppDispatch();
const { togglingStatus } = useAppSelector((state) => state.services);

const handleToggleStatus = async (id: number) => {
  const result = await dispatch(toggleServiceStatus(id));
  if (toggleServiceStatus.fulfilled.match(result)) {
    toast.success('Service status updated successfully');
  }
};
```

## 🛠️ **Benefits of This Architecture**

### **1. Maintainability**
- ✅ Clear separation of concerns
- ✅ Centralized API calls
- ✅ Reusable service methods
- ✅ Easy to debug and trace

### **2. Scalability**
- ✅ Easy to add new features
- ✅ Consistent patterns
- ✅ Type-safe development
- ✅ Predictable state management

### **3. Developer Experience**
- ✅ Better IDE support
- ✅ Compile-time error checking
- ✅ Consistent error handling
- ✅ Clear file structure

### **4. Performance**
- ✅ Optimized Redux state
- ✅ Efficient API calls
- ✅ Proper loading states
- ✅ Optimistic updates

This refactored architecture provides a solid foundation for building scalable, maintainable React applications with proper separation of concerns and type safety, following your preferred patterns and conventions. 