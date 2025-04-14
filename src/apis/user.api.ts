import { authConfig } from '../constants'
import { 
  LoginResponse, 
  RegisterType, 
  RegisterResponse, 
  ReadingListResponse,
  UpdateReadingProgressRequest,
  UpdateReadingProgressResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  GetProfileResponse,
  AddToFavoritesRequest,
  AddToFavoritesResponse,
  RemoveFromFavoritesResponse,
  FavoritesListResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ResendVerificationRequest,
  ResendVerificationResponse
} from '../types/User.type'


/**
 * Login with email and password
 * @param email User email
 * @param password User password
 * @returns LoginResponse with tokens and user information
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // Use the correct endpoint for login
    const response = await fetch(`${authConfig.baseURL}api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    // Save auth data to localStorage after successful login
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    return data as LoginResponse
  } catch (error) {
    throw error
  }
}

/**
 * Register a new user
 * @param userData User registration data (email, password, name)
 * @returns RegisterResponse with message and user information
 */
export const register = async (userData: RegisterType): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${authConfig.baseURL}api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    return data as RegisterResponse
  } catch (error) {
    throw error
  }
}

/**
 * Get the current user's reading list (comics they are currently reading)
 * @returns Promise with reading list data
 */
export const getReadingList = async (
  page: number = 1,
  limit: number = 10
): Promise<ReadingListResponse> => {
  try {
    const accessToken = localStorage.getItem('access_token')
    
    if (!accessToken) {
      throw new Error('Authentication required')
    }

    const response = await fetch(
      `${authConfig.baseURL}api/comic/reading-list?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch reading list')
    }

    return data as ReadingListResponse
  } catch (error) {
    console.error("Error fetching reading list:", error)
    throw error
  }
}

/**
 * Update a user's reading progress for a specific comic
 * @param progressData Object containing slug and chapter information
 * @returns Promise with updated reading progress data
 */
export const updateReadingProgress = async (
  progressData: UpdateReadingProgressRequest
): Promise<UpdateReadingProgressResponse> => {
  try {
    const accessToken = localStorage.getItem('access_token')
    
    if (!accessToken) {
      throw new Error('Authentication required')
    }

    // Fix the API endpoint - change from "comics" to "comic"
    const endpoint = `${authConfig.baseURL}api/comic/update-progress`
   

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(progressData)
    })


    
    const data = await response.json()
 

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update reading progress')
    }

    return data as UpdateReadingProgressResponse
  } catch (error) {
    console.error("Error in updateReadingProgress:", error)
    throw error
  }
}

/**
 * Update user profile information and/or avatar
 * @param profileData Object containing profile update data (name, phone, address, avatar)
 * @returns Promise with updated user profile data
 */
export const updateProfile = async (
  profileData: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  try {
    const accessToken = localStorage.getItem('access_token')
    
    if (!accessToken) {
      throw new Error('Authentication required')
    }

    // Use FormData to handle file upload
    const formData = new FormData()
    
    // Add text fields if they exist
    if (profileData.name) formData.append('name', profileData.name)
    if (profileData.phone) formData.append('phone', profileData.phone)
    if (profileData.address) formData.append('address', profileData.address)
    
    // Add avatar file if it exists
    if (profileData.avatar) formData.append('avatar', profileData.avatar)
    
    const response = await fetch(`${authConfig.baseURL}api/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Don't set Content-Type header for multipart/form-data
        // The browser will set it automatically with the correct boundary
      },
      body: formData
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile')
    }
    
    // Update the local user data in localStorage
    if (data.user) {
      // Instead of partial update, replace the entire user object
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    
    return data as UpdateProfileResponse
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

/**
 * Get the current user's profile information
 * @returns Promise with user profile data
 */
export const getProfile = async (): Promise<GetProfileResponse> => {
  try {
    const accessToken = localStorage.getItem('access_token')
    
    if (!accessToken) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${authConfig.baseURL}api/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user profile')
    }
    
    // Update localStorage with fresh user data to keep everything in sync
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    
    return data as GetProfileResponse
  } catch (error) {
    console.error("Error getting profile:", error)
    throw error
  }
}

/**
 * Add a comic to the user's favorites list
 * @param favoriteData Object containing comic slug and optional last read chapter
 * @returns Promise with updated favorite data
 */
export const addToFavorites = async (
  favoriteData: AddToFavoritesRequest
): Promise<AddToFavoritesResponse> => {
  try {
    const accessToken = localStorage.getItem('access_token')
    
    if (!accessToken) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${authConfig.baseURL}api/comic/favorites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(favoriteData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add comic to favorites')
    }

    return data as AddToFavoritesResponse
  } catch (error) {
    console.error("Error adding to favorites:", error)
    throw error
  }
}

/**
 * Remove a comic from the user's favorites list
 * @param slug Comic slug to remove from favorites
 * @returns Promise with removed favorite data
 */
export const removeFromFavorites = async (
  slug: string
): Promise<RemoveFromFavoritesResponse> => {
  try {
    const accessToken = localStorage.getItem('access_token')
    
    if (!accessToken) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${authConfig.baseURL}api/comic/favorites/${slug}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove comic from favorites')
    }

    return data as RemoveFromFavoritesResponse
  } catch (error) {
    console.error("Error removing from favorites:", error)
    throw error
  }
}

/**
 * Get the user's favorites list
 * @returns Promise with favorites list data
 */
export const getFavoritesList = async (): Promise<FavoritesListResponse> => {
  try {
    const accessToken = localStorage.getItem('access_token')
    
    if (!accessToken) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${authConfig.baseURL}api/comic/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch favorites list')
    }

    return data as FavoritesListResponse
  } catch (error) {
    console.error("Error fetching favorites list:", error)
    throw error
  }
}

/**
 * Request a password reset (forgot password)
 * @param data Object containing user email
 * @returns Promise with response message
 */
export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  try {
    const response = await fetch(`${authConfig.baseURL}api/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to reset password')
    }

    return responseData as ForgotPasswordResponse
  } catch (error) {
    console.error("Error in forgotPassword:", error)
    throw error
  }
}

/**
 * Change user password (when user knows current password)
 * @param data Object containing email, old password, and new password
 * @returns Promise with response message
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  try {
    const accessToken = localStorage.getItem('access_token')
    
    // This can be done with or without authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // If user is logged in, include the token
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const response = await fetch(`${authConfig.baseURL}api/change-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to change password')
    }

    return responseData as ChangePasswordResponse
  } catch (error) {
    console.error("Error in changePassword:", error)
    throw error
  }
}

/**
 * Resend verification email
 * @param data Object containing user email
 * @returns Promise with response message
 */
export const resendVerificationEmail = async (
  data: ResendVerificationRequest
): Promise<ResendVerificationResponse> => {
  try {
    const response = await fetch(`${authConfig.baseURL}api/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to resend verification email')
    }

    return responseData as ResendVerificationResponse
  } catch (error) {
    console.error("Error in resendVerificationEmail:", error)
    throw error
  }
}
