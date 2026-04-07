import service from '@/api/core'

export interface LoginParams {
  username?: string
  password?: string
}

export interface LoginResult {
  token: string
  user: CurrentUser
}

/**
 * Authentication Module API
 */
export const AuthService = {
  /**
   * User Login
   * @param data Login credentials
   * @returns Promise with valid token and user info
   */
  login: (data: LoginParams) => {
    return service.post<ApiResponse<LoginResult>>('/auth/login', data)
  },

  /**
   * Get Current User Info
   * @returns User information
   */
  getCurrentUser: () => {
    return service.get<ApiResponse<CurrentUser>>('/auth/me')
  },

  /**
   * Logout
   */
  logout: () => {
    return service.post<ApiResponse<void>>('/auth/logout')
  }
}
