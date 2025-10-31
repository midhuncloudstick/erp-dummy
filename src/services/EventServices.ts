import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

// const apiUrl = "https://api.cloudhousetechnologies.com/api/v1";  //production
const apiUrl = "https://dev-api.cloudhousetechnologies.com/api/v1"; //development



const ApiClient: AxiosInstance = axios.create({
  baseURL: apiUrl,
});

// ✅ Request interceptor to always get the latest token
ApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Always fetch latest
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Dynamically set Content-Type: let Axios set multipart boundary for FormData
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData) {
    // remove any preset Content-Type so Axios sets multipart/form-data with boundary
    if (config.headers && 'Content-Type' in config.headers) {
      delete (config.headers as any)['Content-Type'];
    }
  } else {
    // default to JSON for non-FormData if not explicitly set
    if (config.headers && !(config.headers as any)['Content-Type']) {
      (config.headers as any)['Content-Type'] = 'application/json; charset=UTF-8';
    }
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