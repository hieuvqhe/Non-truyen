import React, { useState } from 'react'
import { register } from '../../apis/user.api'
import { toast } from "sonner"
import { useNavigate } from 'react-router-dom'
import { useTheme } from "../../components/theme-provider"

const RegisterPage = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
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
    
    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required'
      isValid = false
    }
    
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name
      }
      
      const response = await register(userData)
      
      toast.success(response.message || 'Registration successful! Please check your email to verify your account.')
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
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
          <h1 className="text-primary-foreground text-3xl font-bold">Create Account</h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-primary-foreground/80' : 'text-blue-100'}`}>Sign up for a new account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <label 
              htmlFor="name" 
              className="text-sm font-medium text-card-foreground block"
              aria-label="Full Name"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name ? 'border-destructive' : 'border-input'
              } focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground`}
              tabIndex={0}
              aria-invalid={!!errors.name}
              aria-describedby="name-error"
            />
            {errors.name && (
              <p id="name-error" className="text-destructive text-sm mt-1">
                {errors.name}
              </p>
            )}
          </div>
          
          {/* Email Field */}
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
          
          {/* Password Field */}
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
              placeholder="Create a password"
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
          
          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label 
              htmlFor="confirmPassword" 
              className="text-sm font-medium text-card-foreground block"
              aria-label="Confirm Password"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Confirm your password"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.confirmPassword ? 'border-destructive' : 'border-input'
              } focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground`}
              tabIndex={0}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby="confirmPassword-error"
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-destructive text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            tabIndex={0}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="text-center mt-4">
            <span className="text-muted-foreground">Already have an account? </span>
            <a 
              href="/login" 
              className="text-primary font-medium hover:text-primary/80"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage