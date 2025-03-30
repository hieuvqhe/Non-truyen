import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import TiltedCard from "../../components/TiltedCard";
import comicApi from "../../apis/comic.api";
import { ComicCarousel } from "../../types/Comic.type";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

const NewComic = () => {
  const navigate = useNavigate(); // Initialize navigate hook
  const [comics, setComics] = useState<ComicCarousel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Navigate to comic detail page when a comic is clicked
  const handleComicClick = (slug: string) => {
    navigate(`/truyen-tranh/${slug}`);
  };

  const fetchComics = async (page: number) => {
    try {
      setIsLoading(true);
      const data = await comicApi.getNew(page);
      setComics(data);
      // Assuming the API doesn't return total pages, we estimate it
      // In a real application, the API should return this information
      setTotalPages(Math.max(totalPages, page + 1));
    } catch (error) {
      console.error("Failed to fetch comics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComics(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 650, behavior: "smooth" });
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
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Truyện Mới</h1>

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

      {comics.length > 0 && renderPagination()}
    </div>
  );
};

export default NewComic;
