# Application Architecture Documentation

## Overview

This application follows a modern React architecture with Redux Toolkit for state management, centralized API services, and a clean separation of concerns.

## Architecture Structure

```
src/
├── lib/
│   └── api.ts                 # Centralized API configuration and client
├── services/
│   ├── categoryService.ts     # Category-related API calls
│   └── serviceService.ts      # Service-related API calls
├── store/
│   ├── index.ts              # Redux store configuration
│   ├── hooks.ts              # Typed Redux hooks
│   └── slices/
│       ├── categorySlice.ts  # Category state management
│       └── serviceSlice.ts   # Service state management
└── pages/
    └── CreateServicePage.tsx # Example page using the architecture
```

## API Configuration (`src/lib/api.ts`)

### Base Configuration
- **Base URL**: `https://dev-api.cloudhousetechnologies.com/api/v1`
- **Centralized endpoints**: All API endpoints are defined in one place
- **Generic API client**: Supports GET, POST, PUT, PATCH, DELETE methods

### Usage
```typescript
import { apiClient, API_ENDPOINTS } from '@/lib/api';

// GET request
const data = await apiClient.get('/endpoint');

// POST request
const response = await apiClient.post('/endpoint', payload);
```

## Service Layer (`src/services/`)

### Purpose
- Separates API calls from components
- Provides type-safe interfaces
- Centralizes business logic
- Easy to test and maintain

### Category Service (`categoryService.ts`)
```typescript
// Available methods:
- getCategories(): Promise<CategoryResponse>
- createCategory(data: CreateCategoryRequest): Promise<CreateCategoryResponse>
- updateCategory(id: number, data: CreateCategoryRequest): Promise<CreateCategoryResponse>
- deleteCategory(id: number): Promise<{ success: boolean }>
```

### Service Service (`serviceService.ts`)
```typescript
// Available methods:
- getServices(): Promise<ServiceResponse>
- getServiceById(id: number): Promise<{ data: Service; success: boolean }>
- createService(data: CreateServiceRequest): Promise<CreateServiceResponse>
- updateService(id: number, data: Partial<CreateServiceRequest>): Promise<CreateServiceResponse>
- deleteService(id: number): Promise<{ success: boolean }>
```

## Redux Store (`src/store/`)

### Store Configuration (`index.ts`)
- Configured with Redux Toolkit
- Includes middleware for handling async actions
- Type-safe with TypeScript

### Slices
Each slice manages a specific domain of the application:

#### Category Slice (`categorySlice.ts`)
- **State**: Categories list, loading states, errors
- **Actions**: Fetch categories, create category
- **Async Thunks**: `fetchCategories`, `createCategory`

#### Service Slice (`serviceSlice.ts`)
- **State**: Services list, current service, loading states, errors
- **Actions**: Fetch services, create service, get service by ID
- **Async Thunks**: `fetchServices`, `createService`, `getServiceById`

### Typed Hooks (`hooks.ts`)
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// Use these instead of plain useDispatch and useSelector
const dispatch = useAppDispatch();
const state = useAppSelector((state) => state.categories);
```

## Component Usage Example

### Before (Direct API calls)
```typescript
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(false);

const fetchCategories = async () => {
  setLoading(true);
  try {
    const response = await fetch('https://dev-api.cloudhousetechnologies.com/api/v1/service/categories');
    const data = await response.json();
    setCategories(data.data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

### After (Redux + Services)
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categorySlice';

const dispatch = useAppDispatch();
const { categories, loading } = useAppSelector((state) => state.categories);

useEffect(() => {
  dispatch(fetchCategories());
}, [dispatch]);
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- API calls are isolated in service files
- Business logic is separated from UI components
- State management is centralized

### 2. **Type Safety**
- Full TypeScript support throughout the application
- Compile-time error checking
- Better IDE support and autocomplete

### 3. **Maintainability**
- Easy to find and debug API calls
- Centralized error handling
- Consistent patterns across the application

### 4. **Scalability**
- Easy to add new features
- Reusable service methods
- Predictable state management

### 5. **Testing**
- Services can be easily mocked
- Redux actions are testable
- Components are more focused

## API Endpoints

### Categories
- **GET** `/service/categories` - Fetch all categories
- **POST** `/service/categories` - Create new category
- **PUT** `/service/categories/:id` - Update category
- **DELETE** `/service/categories/:id` - Delete category

### Services
- **GET** `/services` - Fetch all services
- **GET** `/services/:id` - Fetch service by ID
- **POST** `/services` - Create new service
- **PUT** `/services/:id` - Update service
- **DELETE** `/services/:id` - Delete service

## Error Handling

### Service Layer
- All API calls include try-catch blocks
- Errors are thrown with meaningful messages
- Network errors are handled gracefully

### Redux Slices
- Async thunks handle loading, success, and error states
- Error messages are stored in state
- Components can react to error states

### Components
- Toast notifications for user feedback
- Loading states for better UX
- Disabled buttons during operations

## Best Practices

1. **Always use typed hooks**: `useAppDispatch` and `useAppSelector`
2. **Handle loading states**: Show spinners and disable buttons
3. **Provide user feedback**: Use toast notifications for success/error
4. **Validate data**: Check required fields before API calls
5. **Handle errors gracefully**: Show meaningful error messages
6. **Use TypeScript**: Leverage type safety throughout the application

## Adding New Features

### 1. Create Service File
```typescript
// src/services/newFeatureService.ts
import { apiClient, API_ENDPOINTS } from '@/lib/api';

export const newFeatureService = {
  async getData(): Promise<DataResponse> {
    return apiClient.get<DataResponse>('/new-endpoint');
  },
  // ... other methods
};
```

### 2. Create Redux Slice
```typescript
// src/store/slices/newFeatureSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { newFeatureService } from '@/services/newFeatureService';

export const fetchData = createAsyncThunk(
  'newFeature/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await newFeatureService.getData();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ... slice implementation
```

### 3. Add to Store
```typescript
// src/store/index.ts
import newFeatureSlice from './slices/newFeatureSlice';

export const store = configureStore({
  reducer: {
    // ... existing reducers
    newFeature: newFeatureSlice,
  },
});
```

### 4. Use in Component
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchData } from '@/store/slices/newFeatureSlice';

const dispatch = useAppDispatch();
const { data, loading } = useAppSelector((state) => state.newFeature);

useEffect(() => {
  dispatch(fetchData());
}, [dispatch]);
```

This architecture provides a solid foundation for building scalable, maintainable React applications with proper separation of concerns and type safety. 