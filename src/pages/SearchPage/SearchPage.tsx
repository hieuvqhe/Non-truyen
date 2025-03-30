import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TiltedCard from "../../components/TiltedCard";
import { ComicCarousel } from "../../types/Comic.type";
import { ChevronLeft, ChevronRight, BookOpen, Search } from "lucide-react";
import useComicStore from "../../store/comicStore";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const [searchInput, setSearchInput] = useState(keyword);
  
  const { 
    searchResults, 
    isLoadingSearch, 
    currentSearchPage, 
    currentSearchKeyword,
    fetchSearchResults
  } = useComicStore();
  
  const [totalPages, setTotalPages] = useState(1);

  // Navigate to comic detail page when a comic is clicked
  const handleComicClick = (slug: string) => {
    navigate(`/truyen-tranh/${slug}`);
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // Update the URL search parameter
      setSearchParams({ keyword: searchInput });
      // Fetch search results
      fetchSearchResults(searchInput);
    }
  };

  // Initial fetch and when URL params change
  useEffect(() => {
    if (keyword) {
      fetchSearchResults(keyword);
    }
  }, [keyword, fetchSearchResults]);

  // Update page title
  useEffect(() => {
    document.title = `Tìm kiếm: ${keyword} | Non Truyện`;
    return () => {
      document.title = "Non Truyện";
    };
  }, [keyword]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && keyword) {
      fetchSearchResults(keyword, page);
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

    let startPage = Math.max(1, currentSearchPage - Math.floor(maxPagesToShow / 2));
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
            currentSearchPage === i
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
          onClick={() => handlePageChange(currentSearchPage - 1)}
          disabled={currentSearchPage === 1 || isLoadingSearch}
          className="p-2 mr-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 dark:text-white"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        {pages}

        <button
          onClick={() => handlePageChange(currentSearchPage + 1)}
          disabled={currentSearchPage === totalPages || isLoadingSearch}
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          {keyword ? `Kết quả tìm kiếm: ${keyword}` : 'Tìm kiếm truyện'}
        </h1>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nhập tên truyện để tìm kiếm..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoadingSearch}>
            <Search size={16} className="mr-2" />
            Tìm kiếm
          </Button>
        </form>
      </div>

      {isLoadingSearch ? (
        <div className="text-center py-8">Đang tìm kiếm...</div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {searchResults.map((comic, index) => (
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
      ) : keyword ? (
        <div className="text-center py-8 dark:text-white">
          Không tìm thấy kết quả cho "{keyword}"
        </div>
      ) : (
        <div className="text-center py-8 dark:text-white">
          Nhập từ khóa để tìm truyện
        </div>
      )}

      {searchResults.length > 0 && renderPagination()}
    </div>
  );
};

export default SearchPage;