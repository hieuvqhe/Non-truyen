import { Category, CategoryApiResponse } from '../types/Category.type'
import http from '../utils/http'

/**
 * API functions for interacting with category endpoints
 */
const categoryApi = {
  /**
   * Fetches all categories from the API
   * @returns Promise with category data
   */
  getAll: () => {
    return http.get<CategoryApiResponse>('/the-loai').then((response) => ({
      data: {
        items: response.data.data.items.map((item) => ({
          _id: item._id,
          name: item.name,
          slug: item.slug
        })) as Category[]
      }
    }))
  }
}

export default categoryApi