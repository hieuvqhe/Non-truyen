import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useComicStore from "../../store/comicStore";

const ChapterDetail = () => {
  const { slug, chapterName } = useParams<{
    slug: string;
    chapterName: string;
  }>();
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);

  // Get state and actions from store
  const {
    currentComic,
    currentChapter,
    isLoadingComicDetail,
    isLoadingChapter,
    error,
    fetchComicDetail,
    fetchChapterDetail,
  } = useComicStore();

  // Local state for image loading and UI
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [showChapterSelect, setShowChapterSelect] = useState<boolean>(false);
  const [forceShowImages, setForceShowImages] = useState<boolean>(false);

  // Fetch comic details if not loaded
  useEffect(() => {
    if (!slug) return;

    if (!currentComic || currentComic.slug !== slug) {
      fetchComicDetail(slug);
    }
  }, [slug, currentComic, fetchComicDetail]);

  // Get current chapter URL and fetch chapter details
  useEffect(() => {
    if (!currentComic || !chapterName) return;

    // Find chapter in all servers
    const allChapters = currentComic.chapters.flatMap(
      (server) => server.chapters
    );
    const selectedChapter = allChapters.find(
      (chapter) => chapter.name === chapterName
    );

    if (selectedChapter) {
      fetchChapterDetail(selectedChapter.url);
    }
  }, [currentComic, chapterName, fetchChapterDetail]);

  // Reset loaded images state when chapter changes
  useEffect(() => {
    setLoadedImages({});
    setForceShowImages(false);

    // Force show images after a timeout in case events don't fire
    const timer = setTimeout(() => {
      console.log("Force showing images after timeout");
      setForceShowImages(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [chapterName]);

  // Image loading tracker - improved version
  const handleImageLoad = (page: number) => {
    setLoadedImages((prev) => ({
      ...prev,
      [page]: true,
    }));
  };

  // Add error handling for images
  const handleImageError = (page: number) => {
    console.error(`Failed to load image ${page}`);
    // Mark as loaded anyway to remove the loading indicator
    setLoadedImages((prev) => ({
      ...prev,
      [page]: true,
    }));
  };

  // Get next and previous chapters
  const getAdjacentChapters = () => {
    if (!currentComic) return { nextChapter: null, prevChapter: null };

    const allChapters = currentComic.chapters.flatMap(
      (server) => server.chapters
    );
    const currentIndex = allChapters.findIndex(
      (chapter) => chapter.name === chapterName
    );

    return {
      nextChapter: currentIndex > 0 ? allChapters[currentIndex - 1] : null,
      prevChapter:
        currentIndex < allChapters.length - 1
          ? allChapters[currentIndex + 1]
          : null,
    };
  };

  const { nextChapter, prevChapter } = getAdjacentChapters();

  // Function to handle chapter change from dropdown
  const handleChapterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedChapterName = event.target.value;
    if (selectedChapterName) {
      navigate(`/truyen-tranh/${slug}/chapter/${selectedChapterName}`);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Toggle chapter select dropdown
  const toggleChapterSelect = () => {
    setShowChapterSelect((prev) => !prev);
  };

  // Loading state
  if (isLoadingComicDetail || isLoadingChapter) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-xl">Loading chapter...</div>
      </div>
    );
  }

  // Error state
  if (error || !currentComic || !currentChapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="text-xl text-red-500">
          {error || "Chapter not found"}
        </div>
        <Link 
          to={`/truyen-tranh/${slug}`} 
          className="px-4 py-2 bg-secondary hover:bg-secondary/90 rounded-md transition-colors"
        >
          Back to Comic
        </Link>
      </div>
    );
  }

  // All chapters for dropdown
  const allChapters = currentComic.chapters.flatMap(
    (server) => server.chapters
  );

  return (
    <div className="flex flex-col items-center pb-20" ref={topRef}>
      {/* Chapter header */}
      <div className="w-full bg-background/50 dark:bg-black/50 sticky top-0 z-10 backdrop-blur-md py-4 px-4 border-b">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-lg md:text-xl font-bold">
              {currentComic.title}
            </h1>
            <h2 className="text-base text-muted-foreground">
              Chapter {currentChapter.chapterName}
              {currentChapter.chapterTitle &&
                ` - ${currentChapter.chapterTitle}`}
            </h2>
          </div>

          {/* Navigation with chapter selection */}
          <div className="flex items-center space-x-2">
            <select
              value={chapterName}
              onChange={handleChapterChange}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
              aria-label="Select chapter"
            >
              {allChapters.map((chapter) => (
                <option key={chapter.name} value={chapter.name}>
                  Chapter {chapter.name}{" "}
                  {chapter.title ? `- ${chapter.title}` : ""}
                </option>
              ))}
            </select>

            <Link
              to={`/truyen-tranh/${slug}`}
              className="px-3 py-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-md text-sm"
              aria-label="Back to comic details"
            >
              ⓘ Info
            </Link>

            {nextChapter && (
              <Link
                to={`/truyen-tranh/${slug}/chapter/${nextChapter.name}`}
                className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm"
                aria-label="Next chapter"
              >
                ← Previous
              </Link>
            )}

            {prevChapter && (
              <Link
                to={`/truyen-tranh/${slug}/chapter/${prevChapter.name}`}
                className="px-3 py-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-md text-sm"
                aria-label="Previous chapter"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Chapter Images */}
      <div className="max-w-4xl w-full mx-auto px-4 mt-8">
        {currentChapter.images.map((image, index) => {
          // Generate a guaranteed unique key for this render
          const imageKey =
            image.uniqueId ||
            `${slug}-${currentChapter.chapterName}-${index}-${Date.now()}`;
          const isLoaded = loadedImages[image.page];

          return (
            <div key={imageKey} className="flex flex-col items-center">
              {/* Loading placeholder - only show if not loaded and not force showing */}
              {!isLoaded && !forceShowImages && (
                <div className="w-full h-[300px] bg-muted flex items-center justify-center">
                  <div className="text-muted-foreground">
                    Loading image {image.page}...
                  </div>
                </div>
              )}

              {/* Actual image - Improved visibility logic */}
              <img
                src={image.imageUrl}
                alt={`Page ${image.page}`}
                className={`w-full object-contain ${
                  isLoaded || forceShowImages ? "block" : ""
                }`}
                onLoad={() => handleImageLoad(image.page)}
                onError={() => handleImageError(image.page)}
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      {/* Next or Previous chap */}
        <div className="w-full max-w-4xl mx-auto px-4 mt-8 flex justify-between">
          
        {nextChapter && (
            <Link
                to={`/truyen-tranh/${slug}/chapter/${nextChapter.name}`}
                className="px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm"
                aria-label="Next chapter"
            >
              ← Previous Chapter
            </Link>
            )}
            {prevChapter && (
            <Link
                to={`/truyen-tranh/${slug}/chapter/${prevChapter.name}`}
                className="px-3 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-md text-sm"
                aria-label="Previous chapter"
            >
                  Next Chapter →
               
            </Link>
            )}
    
            </div>

      {/* Left side chapter navigation */}
      <div className="fixed bottom-16 left-4 z-20">
        <div className="flex flex-col bg-background/70 dark:bg-black/70 backdrop-blur-md rounded-lg overflow-hidden border shadow-md">
          <button
            onClick={toggleChapterSelect}
            className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-sm w-full text-left flex justify-between items-center"
          >
            <span>Chapter {chapterName}</span>
            <span>{showChapterSelect ? "▲" : "▼"}</span>
          </button>

          {showChapterSelect && (
            <div className="max-h-48 overflow-y-auto bg-background dark:bg-card p-2">
              {allChapters.map((chapter) => (
                <Link
                  key={chapter.name}
                  to={`/truyen-tranh/${slug}/chapter/${chapter.name}`}
                  className={`block px-2 py-1 rounded text-sm ${
                    chapter.name === chapterName
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  Chapter {chapter.name}
                </Link>
              ))}
            </div>
          )}
          <div className="flex">
            {nextChapter && (
              <Link
                to={`/truyen-tranh/${slug}/chapter/${nextChapter.name}`}
                className="px-2 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs flex-1 text-center"
                aria-label="Next chapter"
              >
                ← Prev
              </Link>
            )}

            {prevChapter && (
              <Link
                to={`/truyen-tranh/${slug}/chapter/${prevChapter.name}`}
                className="px-2 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs flex-1 text-center"
                aria-label="Previous chapter"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-16 right-4 z-20 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
};

export default ChapterDetail;
