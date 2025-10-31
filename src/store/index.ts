import { configureStore } from '@reduxjs/toolkit';
import categorySlice from './slices/categorySlice';
import serviceSlice from './slices/serviceSlice';
import productSlice from './slices/productSlice';
import authSlice from './slices/authSlice';
import industrySlice from './slices/industrySlice';
import middlemanSlice from './slices/middlemanSlice';
import customersSlice from './slices/customerSlice';
import createTodoListSLice from '../store/slices/todoListSlice';
import roleSlice from './slices/roleSlice';
import invoiceSlice from './slices/invoiceSlice';
import ticketReducer from './slices/ticketSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    categories: categorySlice,
    services: serviceSlice,
    industries: industrySlice,
    products: productSlice,
    middlemen: middlemanSlice,
    customers: customersSlice,
    todoList:createTodoListSLice,
    roles: roleSlice,
    invoice: invoiceSlice,
    ticket: ticketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['categories/fetchCategories/pending', 'categories/fetchCategories/fulfilled', 'categories/fetchCategories/rejected', 'auth/login/pending', 'auth/login/fulfilled', 'auth/login/rejected', 'auth/register/pending', 'auth/register/fulfilled', 'auth/register/rejected', 'industries/fetchIndustries/pending', 'industries/fetchIndustries/fulfilled', 'industries/fetchIndustries/rejected', 'industries/createIndustry/pending', 'industries/createIndustry/fulfilled', 'industries/createIndustry/rejected'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;