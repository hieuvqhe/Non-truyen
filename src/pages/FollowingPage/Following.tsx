import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft, ChevronRight, Star } from "lucide-react";
import TiltedCard from "../../components/TiltedCard";
import { getFavoritesList } from "../../apis/user.api";
import comicApi from "../../apis/comic.api";

interface FavoriteItem {
  slug: string;
  lastReadChapter?: string;
  lastReadAt?: string;
}

interface ComicDetail {
  title: string;
  thumbnail: string;
  slug: string;
  lastReadChapter: string | undefined;
  lastReadAt: string | undefined;
}

interface PaginationInfo {
  totalPages: number;
  // Add other pagination properties if needed
}

interface FavoritesListResponse {
  data: FavoriteItem[];
  pagination?: PaginationInfo;
}

const Following = () => {
  const navigate = useNavigate();
  const [favoritesList, setFavoritesList] = useState<ComicDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(24); // Display 24 comics per page to match NewComic

  useEffect(() => {
    // Set page title
    document.title = "Truyện đang theo dõi | Non Truyện";
    
    return () => {
      document.title = "Non Truyện";
    };
  }, []);

  useEffect(() => {
    const fetchFavoritesList = async () => {
      try {
        setIsLoading(true);
        const response = await getFavoritesList() as FavoritesListResponse;
        
        if (response && response.data && Array.isArray(response.data)) {
          // Set total pages from pagination info if available
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages || 1);
          } else {
            // If pagination info is not available, calculate it based on items per page
            setTotalPages(Math.ceil(response.data.length / itemsPerPage) || 1);
          }
          
          // For each comic in favorites list, fetch details
          const comicDetailsPromises = response.data.map(async (item: FavoriteItem) => {
            try {
              const comicDetail = await comicApi.getDetail(item.slug);
              return {
                title: comicDetail.title,
                thumbnail: comicDetail.thumbnail,
                slug: item.slug,
                lastReadChapter: item.lastReadChapter,
                lastReadAt: item.lastReadAt
              };
            } catch (err) {
              console.error(`Error fetching details for comic ${item.slug}:`, err);
              return null;
            }
          });
          
          const comicDetails = (await Promise.all(comicDetailsPromises)).filter(
            (comic): comic is ComicDetail => comic !== null
          );
          
          setFavoritesList(comicDetails);
        } else {
          console.error("Invalid response format:", response);
          setFavoritesList([]);
        }
      } catch (error) {
        console.error("Failed to fetch favorites list:", error);
        setFavoritesList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoritesList();
  }, [currentPage, itemsPerPage]);

  const handleViewComic = (slug: string) => {
    navigate(`/truyen-tranh/${slug}`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getTimeAgo = (lastReadAt?: string) => {
    if (!lastReadAt) return "Chưa đọc";
    
    const now = new Date();
    const updated = new Date(lastReadAt);
    const diffMs = now.getTime() - updated.getTime();

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} ngày trước`;
    if (diffHours > 0) return `${diffHours} giờ trước`;
    return `${diffMins} phút trước`;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          }`}
          aria-label={`Page ${i}`}
          tabIndex={0}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="p-2 mr-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 dark:text-white"
          aria-label="Previous page"
          tabIndex={0}
        >
          <ChevronLeft size={18} />
        </button>

        {pages}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="p-2 ml-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 dark:text-white"
          aria-label="Next page"
          tabIndex={0}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-white transition-colors duration-200">Truyện Đang Theo Dõi</h1>

      {isLoading ? (
        <div className="text-center py-12 dark:text-white transition-colors duration-200">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang tải danh sách truyện...</p>
        </div>
      ) : favoritesList.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-200 dark:text-white">
          <p className="text-lg">Bạn chưa theo dõi truyện nào.</p>
          <button 
            onClick={() => navigate("/truyen-moi")} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            aria-label="Khám phá truyện mới"
            tabIndex={0}
          >
            Khám phá truyện mới
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {favoritesList.map((comic, index) => (
              <div 
                key={index} 
                className="flex flex-col cursor-pointer transition-transform hover:scale-105" 
                onClick={() => handleViewComic(comic.slug)}
              >
                <TiltedCard
                  imageSrc={comic.thumbnail || "https://picsum.photos/seed/placeholder/800/600"}
                  altText={comic.title || "Comic image"}
                  captionText=""
                  containerHeight="240px"
                  containerWidth="100%"
                  imageHeight="240px"
                  imageWidth="160px"
                  scaleOnHover={1.1}
                  rotateAmplitude={14}
                  showMobileWarning={true}
                  showTooltip={true}
                  overlayContent={
                    <div className="text-white text-xs p-1 bg-black bg-opacity-70">
                      <div className="flex items-center">
                        <Star size={12} className="text-yellow-400 mr-1" />
                        <span>Đang theo dõi</span>
                      </div>
                      {comic.lastReadAt && (
                        <div className="mt-1">
                          Đọc {getTimeAgo(comic.lastReadAt)}
                        </div>
                      )}
                    </div>
                  }
                  displayOverlayContent={true}
                />
                <div className="mt-2">
                  <h3 className="font-semibold text-sm truncate text-gray-800 dark:text-gray-100 transition-colors duration-200">
                    {comic.title}
                  </h3>
                  {comic.lastReadChapter && (
                    <div className="flex items-center mt-1 justify-center">
                      <BookOpen
                        size={14}
                        className="text-blue-600 dark:text-blue-400 mr-1 transition-colors duration-200"
                      />
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        Đang đọc: Chap {comic.lastReadChapter}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default Following;