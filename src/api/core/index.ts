import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

// Define standard API response structure
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
})

// Request Interceptor
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Placeholder for token logic
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    // Basic logic: if code is not 200, it's an error. 
    // Adjust according to actual backend agreement.
    if (res.code !== 200) {
      // Handle business error
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return response
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

export default service
