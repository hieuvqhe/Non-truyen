import http from '../utils/http';
import { ComicCarousel, mapToComicCarousel, mapToComicDetail, ChapterDetail } from '../types/Comic.type';

// CDN URL for images
const cdnUrl = 'https://img.otruyenapi.com';

// New interfaces for API response
interface ChapterImageApi {
  image_page: number;
  image_file: string;
}

interface ChapterItemApi {
  _id: string;
  comic_name: string;
  chapter_name: string;
  chapter_title: string;
  chapter_path: string;
  chapter_image: ChapterImageApi[];
}

interface ChapterApiResponse {
  status: string;
  message: string;
  data: {
    domain_cdn: string;
    item: ChapterItemApi;
  };
}

// Helper function to map chapter detail API data
export const mapToChapterDetail = (apiChapter: ChapterItemApi, domainCdn: string): ChapterDetail => {
  // Generate a timestamp to ensure uniqueness even if the same chapter is fetched multiple times
  const timestamp = Date.now();
  // Generate a unique string ID for this chapter
  const chapterUniqueId = `${apiChapter._id}-${apiChapter.chapter_name}-${timestamp}`;
  
  // Ensure images have truly unique identifiers
  const uniqueImages = apiChapter.chapter_image.map((img, index) => ({
    page: img.image_page,
    imageUrl: `${domainCdn}/${apiChapter.chapter_path}/${img.image_file}`,
    uniqueIndex: index, // Keep for backward compatibility
    uniqueId: `${chapterUniqueId}-img-${index}` // Guaranteed to be unique across all requests
  }));

  return {
    chapterName: apiChapter.chapter_name,
    chapterTitle: apiChapter.chapter_title || '',
    images: uniqueImages
  };
};

/**
 * API functions for interacting with comic endpoints
 */
const comicApi = {
  /**
   * Fetches comics for the home page
   * @returns Promise with comic data for home page
   */
  getHome: () => {
    return http.get<any>('/home').then(response => {
      const apiData = response.data.data.items;
      return apiData.map((item: any) => mapToComicCarousel(item, cdnUrl));
    });
  },

  /**
   * Fetches comics by genre and page number
   * @param genre - genre slug to filter comics
   * @param page - page number for pagination
   * @returns Promise with comic data for the specified genre
   */
  getByGenre: (genre: string, page: number = 1) => {
    return http.get<any>(`/the-loai/${genre}?page=${page}`).then(response => {
      const apiData = response.data.data.items;
      return apiData.map((item: any) => mapToComicCarousel(item, cdnUrl));
    });
  },

  /**
   * Fetches comics by category with pagination
   * @param categorySlug - category slug to filter comics
   * @param page - page number for pagination
   * @returns Promise with comic data for the specified category
   */
  getCategory: (categorySlug: string, page: number = 1) => {
    return http.get<any>(`/the-loai/${categorySlug}?page=${page}`).then(response => {
      const apiData = response.data.data.items;
      return apiData.map((item: any) => mapToComicCarousel(item, cdnUrl));
    });
  },

  /**
   * Fetches new comics with pagination
   * @param page - page number for pagination
   * @returns Promise with comic data for new comics (24 comics per page)
   */
  getNew: (page: number = 1) => {
    return http.get<any>(`/danh-sach/truyen-moi?page=${page}`).then(response => {
      const apiData = response.data.data.items;
      return apiData.map((item: any) => mapToComicCarousel(item, cdnUrl));
    });
  },

  /**
   * Searches for comics by keyword with pagination
   * @param keyword - search term to find comics
   * @param page - page number for pagination
   * @returns Promise with comic data matching the search term
   */
  search: (keyword: string, page: number = 1) => {
    return http.get<any>(`/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`).then(response => {
      const apiData = response.data.data.items;
      return apiData.map((item: any) => mapToComicCarousel(item, cdnUrl));
    });
  },

  /**
   * Fetches detailed information for a specific comic
   * @param slug - comic slug to fetch details for
   * @returns Promise with detailed comic data
   */
  getDetail: (slug: string) => {
    return http.get<any>(`/truyen-tranh/${slug}`).then(response => {
      const { item, APP_DOMAIN_CDN_IMAGE } = response.data.data;
      // Use the CDN URL from the API response if available, otherwise fallback to the default
      return mapToComicDetail(item, APP_DOMAIN_CDN_IMAGE || cdnUrl);
    });
  },

  /**
   * Fetches detailed information for a specific chapter
   * @param chapterUrl - full URL to fetch chapter details
   * @returns Promise with detailed chapter data including images
   */
  getChapterDetail: (chapterUrl: string) => {
    return http.get<ChapterApiResponse>(chapterUrl).then(response => {
      const { item, domain_cdn } = response.data.data;
      return mapToChapterDetail(item, domain_cdn);
    });
  }
};

export default comicApi;