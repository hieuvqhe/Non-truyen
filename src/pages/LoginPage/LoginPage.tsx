import React, { useState } from 'react'
import { login } from '../../apis/user.api'
import { toast } from "sonner"
import { useNavigate } from 'react-router-dom'
import { useTheme } from "../../components/theme-provider"
import useAuthStore from '../../store/authStore'

const LoginPage = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { setUser } = useAuthStore() // Get setUser function from auth store
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { ...errors }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
      isValid = false
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
      isValid = false
    }
    
    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      const response = await login(formData.email, formData.password)
      
      // Save tokens to localStorage
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Update auth store with user data
      setUser(response.user)
      
      toast.success('Login successful!')
      
      // Redirect to home or dashboard
      setTimeout(() => {
        navigate('/')
      }, 1000)
      
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const form = e.currentTarget.closest('form')
      if (form) form.requestSubmit()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-border bg-card">
        <div className={`p-6 text-center ${theme === 'dark' ? 'bg-primary' : 'bg-blue-600'}`}>
          <h1 className="text-primary-foreground text-3xl font-bold">Welcome Back</h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-primary-foreground/80' : 'text-blue-100'}`}>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="text-sm font-medium text-card-foreground block"
              aria-label="Email address"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter your email"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-destructive' : 'border-input'
              } focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground`}
              tabIndex={0}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
            />
            {errors.email && (
              <p id="email-error" className="text-destructive text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="text-sm font-medium text-card-foreground block"
              aria-label="Password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.password ? 'border-destructive' : 'border-input'
              } focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground`}
              tabIndex={0}
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
            />
            {errors.password && (
              <p id="password-error" className="text-destructive text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                tabIndex={0}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-card-foreground">
                Remember me
              </label>
            </div>
            
            <a 
              href="/forgot-password" 
              className="text-sm font-medium text-primary hover:text-primary/80"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              Forgot password?
            </a>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            tabIndex={0}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="text-center mt-4">
            <span className="text-muted-foreground">Don't have an account? </span>
            <a 
              href="/register" 
              className="text-primary font-medium hover:text-primary/80"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage