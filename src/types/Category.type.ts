/**
 * Interface representing a category in the system
 */
export interface Category {
  /**
   * Unique identifier for the category (MongoDB ObjectId)
   */
  _id: string;
  
  /**
   * URL-friendly slug for the category
   */
  slug: string;
  
  /**
   * Display name of the category
   */
  name: string;
}

/**
 * Type for the API response containing categories
 */
export interface CategoryApiResponse {
  status: string;
  message: string;
  data: {
    items: Category[];
  };
}
