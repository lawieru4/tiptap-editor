import { useRequest } from 'vue-hooks-plus'
import { AuthService } from '@/api/modules/auth'
import { useRouter } from 'vue-router'


/**
 * User Business Logic Hook
 * Encapsulates login logic and state management
 */
export function useUser() {
  const router = useRouter()

  // Login Request
  const { 
    run: login, 
    loading: loginLoading,
    error: loginError 
  } = useRequest(AuthService.login, {
    manual: true,
    onSuccess: (res) => {
      // Logic for success: save token, redirect
      localStorage.setItem('token', res.data.data.token)
      router.push('/dashboard') // Example redirect
    },
    onError: (err) => {
      console.error('Login Failed', err)
    }
  })

  return {
    login,
    loginLoading,
    loginError
  }
}
