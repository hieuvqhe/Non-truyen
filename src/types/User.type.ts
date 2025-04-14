export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  avatar: string;
  role: "user" | "admin";
  verified: boolean;
  createdAt: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
  };
}

export interface RegisterType {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Reading list related types
export interface ReadingListItem {
  slug: string;
  lastReadChapter: string;
  lastReadAt: string;
}

export interface ReadingListResponse {
  message: string;
  data: ReadingListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface UpdateReadingProgressRequest {
  slug: string;
  chapter: string;
}

export interface UpdateReadingProgressResponse {
  message: string;
  data: ReadingListItem;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: File | null;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface GetProfileResponse {
  user: User;
}

// Favorites related types
export interface FavoriteItem {
  slug: string;
  lastReadChapter?: string;
  lastReadAt?: string;
}

export interface AddToFavoritesRequest {
  slug: string;
  chapter?: string;
}

export interface AddToFavoritesResponse {
  message: string;
  data: FavoriteItem;
}

export interface RemoveFromFavoritesResponse {
  message: string;
  data: {
    slug: string;
  };
}

export interface FavoritesListResponse {
  message: string;
  count: number;
  data: FavoriteItem[];
}

// Password management interfaces
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}