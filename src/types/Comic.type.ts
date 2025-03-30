// Base Interface cho các thông tin chung
export interface ComicBase {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    status: 'ongoing' | 'completed';
    genres: string[];
  }
  
  // Type cho Carousel (chỉ cần thông tin cơ bản)
  export interface ComicCarousel extends ComicBase {
    latestChapter: {
      chapterName: string;
      chapterUrl: string;
    };
    og_image?: string; // Add og_image property for thumbnails
    origin_name?: string[]; // Add origin_name property for display
    thumb_url?: string; // Add the original thumb_url for direct access
    updatedAt?: string; // Add updatedAt property for display
  }
  
  // Type chi tiết cho trang thông tin truyện
  export interface Comic extends ComicBase {
    content: string;
    authors: string[];
    chapters: Chapter[];
    seoInfo?: {
      title: string;
      description: string;
      ogImage: string;
    };
    origin_name: string[]; // Add origin_name property for display
  }
  
  // Phụ type cho chapter
  export interface Chapter {
    serverName: string;
    chapters: {
      name: string;
      url: string;
      title?: string;
    }[];
  }

  // Interface for chapter detail
  export interface ChapterDetail {
    chapterName: string;
    chapterTitle: string;
    images: ChapterImage[];
  }
  
  export interface ChapterImage {
    page: number;
    imageUrl: string;
    uniqueIndex?: number; // Keep for backward compatibility
    uniqueId: string;     // Add new unique identifier
  }
  
  // Helper function map API data
  export const mapToComicCarousel = (apiData: any, cdnUrl: string): ComicCarousel => ({
    id: apiData._id,
    title: apiData.name,
    slug: apiData.slug,
    thumbnail: `${cdnUrl}/uploads/comics/${apiData.thumb_url}`,
    status: apiData.status,
    genres: apiData.category.map((cat: any) => cat.name),
    latestChapter: {
      chapterName: apiData.chaptersLatest?.[0]?.chapter_name || '',
      chapterUrl: apiData.chaptersLatest?.[0]?.chapter_api_data || ''
    },
    og_image: apiData.thumb_url ? `/uploads/comics/${apiData.thumb_url}` : '',
    origin_name: apiData.origin_name || [],
    thumb_url: apiData.thumb_url,
    updatedAt: apiData.updatedAt || ''
  });
  
  export const mapToComicDetail = (apiData: any, cdnUrl: string): Comic => ({
    ...mapToComicCarousel(apiData, cdnUrl),
    content: apiData.content,
    authors: apiData.author || [],
    chapters: apiData.chapters.map((server: any) => ({
      serverName: server.server_name,
      chapters: server.server_data.map((chap: any) => ({
        name: chap.chapter_name,
        url: chap.chapter_api_data,
        title: chap.chapter_title
      }))
    })),
    seoInfo: {
      title: apiData.seoOnPage?.titleHead || '',
      description: apiData.seoOnPage?.descriptionHead || '',
      ogImage: `${cdnUrl}/uploads/${apiData.seoOnPage?.og_image?.[0] || ''}`
    },
    origin_name: apiData.origin_name || []
  });

  // Helper function to map chapter detail API data
  export const mapToChapterDetail = (apiChapter: any, domainCdn: string): ChapterDetail => {
    return {
      chapterName: apiChapter.chapter_name,
      chapterTitle: apiChapter.chapter_title || '',
      images: apiChapter.chapter_image.map((img: any) => ({
        page: img.image_page,
        // Correctly construct the full image URL by combining domain_cdn + chapter_path + image_file
        imageUrl: `${domainCdn}/${apiChapter.chapter_path}/${img.image_file}`
      }))
    };
  };