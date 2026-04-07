export {}

declare global {
  // Common API Response Structure
  interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
  }

  // Pagination Result Structure
  interface PageResult<T = any> {
    list: T[]
    total: number
    pageNum: number
    pageSize: number
  }

  // Common User Interface
  interface CurrentUser {
    id: string
    username: string
    email?: string
    avatar?: string
    role?: string[]
  }
}
