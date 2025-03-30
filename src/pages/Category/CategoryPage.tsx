import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TiltedCard from "../../components/TiltedCard";
import comicApi from "../../apis/comic.api";
import { ComicCarousel } from "../../types/Comic.type";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import categoryApi from "../../apis/category.api";
import { Category } from "../../types/Category.type";

const CategoryPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [comics, setComics] = useState<ComicCarousel[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Navigate to comic detail page when a comic is clicked
  const handleComicClick = (slug: string) => {
    navigate(`/truyen-tranh/${slug}`);
  };

  // Fetch category info
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      try {
        const response = await categoryApi.getAll();
        const categories = response.data.items;
        const foundCategory = categories.find(cat => cat.slug === slug);
        if (foundCategory) {
          setCategory(foundCategory);
        }
      } catch (error) {
        console.error("Failed to fetch category info:", error);
      }
    };

    if (slug) {
      fetchCategoryInfo();
    }
  }, [slug]);

  // Fetch comics for this category
  useEffect(() => {
    const fetchComics = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        const data = await comicApi.getCategory(slug, currentPage);
        setComics(data);
        // Assuming the API doesn't return total pages, we estimate it
        setTotalPages(Math.max(totalPages, currentPage + 1));
      } catch (error) {
        console.error("Failed to fetch comics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComics();
  }, [slug, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getTimeAgo = (updatedAt: string) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffMs = now.getTime() - updated.getTime();

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} ngày trước`;
    if (diffHours > 0) return `${diffHours} giờ trước`;
    return `${diffMins} phút trước`;
  };

  const renderPagination = () => {
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
        >
          <ChevronLeft size={18} />
        </button>

        {pages}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="p-2 ml-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 dark:text-white"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        {category ? category.name : 'Loading category...'}
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading comics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {comics.map((comic, index) => (
              <div 
                key={comic.id || index} 
                className="flex flex-col cursor-pointer transition-transform hover:scale-105" 
                onClick={() => handleComicClick(comic.slug)}
              >
                <TiltedCard
                  imageSrc={
                    comic.thumbnail ||
                    "https://picsum.photos/seed/placeholder/800/600"
                  }
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
                      {getTimeAgo(comic.updatedAt || new Date().toISOString())}
                    </div>
                  }
                  displayOverlayContent={true}
                />
                <div className="mt-2">
                  <h3 className="font-semibold text-sm truncate text-gray-800 dark:text-gray-100">
                    {comic.title}
                  </h3>
                  <div className="flex items-center mt-1 justify-center">
                    <BookOpen
                      size={14}
                      className="text-blue-600 dark:text-blue-400 mr-1 transition-colors duration-200"
                    />
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                      Chap {comic.latestChapter?.chapterName || "Chưa có chapter"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comics.length === 0 && !isLoading ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-600 dark:text-gray-400">Không tìm thấy truyện trong thể loại này.</p>
            </div>
          ) : null}

          {comics.length > 0 && renderPagination()}
        </>
      )}
    </div>
  );
};

export default CategoryPage;