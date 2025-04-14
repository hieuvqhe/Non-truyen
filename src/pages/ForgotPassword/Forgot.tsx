import React, { useState } from 'react'
import { forgotPassword } from '../../apis/user.api'
import { toast } from "sonner"
import { useNavigate } from 'react-router-dom'
import { useTheme } from "../../components/theme-provider"

const Forgot = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError('') // Clear error when user types
  }

  const validateEmail = () => {
    if (!email) {
      setError('Email is required')
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail()) return
    
    setIsLoading(true)
    try {
      await forgotPassword({ email })
      
      // Show success message
      toast.success('A new password has been sent to your email')
      setIsSubmitted(true)
      
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

  const handleBackToLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-border bg-card">
        <div className={`p-6 text-center ${theme === 'dark' ? 'bg-primary' : 'bg-blue-600'}`}>
          <h1 className="text-primary-foreground text-3xl font-bold">Forgot Password</h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-primary-foreground/80' : 'text-blue-100'}`}>
            Reset your password
          </p>
        </div>
        
        {!isSubmitted ? (
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
                value={email}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-lg border ${
                  error ? 'border-destructive' : 'border-input'
                } focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground`}
                tabIndex={0}
                aria-invalid={!!error}
                aria-describedby="email-error"
              />
              {error && (
                <p id="email-error" className="text-destructive text-sm mt-1">
                  {error}
                </p>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a new password to reset your account.
            </p>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              tabIndex={0}
            >
              {isLoading ? 'Sending...' : 'Reset Password'}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button" 
                onClick={handleBackToLogin}
                className="text-primary font-medium hover:text-primary/80"
                tabIndex={0}
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-center">
                A new password has been sent to your email address. Please check your inbox.
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Please check both your inbox and spam folders. If you don't receive an email within a few minutes, you can try again.
            </p>
            
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                tabIndex={0}
              >
                Back to Login
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setEmail('')
                  setIsSubmitted(false)
                }}
                className="w-full bg-secondary text-secondary-foreground py-3 px-4 rounded-lg hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                tabIndex={0}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Forgot