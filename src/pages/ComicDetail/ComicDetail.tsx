import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SpotlightCard from '../../components/SpotlightCard';
import { Comic } from '../../types/Comic.type';
import comicApi from '../../apis/comic.api';

const ComicDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [comic, setComic] = useState<Comic | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const chaptersPerPage = 50;

  useEffect(() => {
    const fetchComicDetail = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const data = await comicApi.getDetail(slug);
        setComic(data);
      } catch (err) {
        setError('Failed to load comic details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComicDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-xl">Loading comic details...</div>
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="flex flex-col mt-40 items-center justify-center h-[600px] space-y-4">
        <div className="text-xl text-red-500">{error || 'Comic not found'}</div>
        <Link 
          to="/" 
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
          tabIndex={0}
          aria-label="Return to home page"
        >
          Return Home
        </Link>
      </div>
    );
  }

  // Get all chapters across all servers
  const allChapters = comic.chapters.flatMap(server => server.chapters);
  
  // Get first and latest chapter
  const firstChapter = allChapters.length > 0 ? 
    allChapters[allChapters.length - 1] : null;
  const latestChapter = allChapters.length > 0 ? 
    allChapters[0] : null;
  
  // Calculate total pages
  const totalChapters = allChapters.length;
  const totalPages = Math.ceil(totalChapters / chaptersPerPage);
  
  // Get current page chapters
  const startIndex = (currentPage - 1) * chaptersPerPage;
  const endIndex = Math.min(startIndex + chaptersPerPage, totalChapters);
  const currentChapters = allChapters.slice(startIndex, endIndex);
  
  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, document.getElementById('chapters-section')?.offsetTop || 0);
  };

  return (
    <div className="flex flex-col pt-5 px-4 pb-16 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Comic Image with SpotlightCard */}
        <div className="md:col-span-1">
          <SpotlightCard className="h-full">
            <img 
              src={comic.thumbnail} 
              alt={comic.title} 
              className="w-full h-auto rounded-xl object-cover"
            />
          </SpotlightCard>
        </div>
        
        {/* Comic Details */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">{comic.title}</h1>
          
          {/* Origin Name */}
          {comic.origin_name && comic.origin_name.length > 0 && (
            <div className="text-neutral-400 text-lg italic">
              {comic.origin_name.join(' / ')}
            </div>
          )}
          
          {/* Authors/Directors */}
          {comic.authors && comic.authors.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-neutral-400">Author:</span>
              <span className="font-medium">{comic.authors.join(', ')}</span>
            </div>
          )}
          
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Status:</span>
            <span className={`font-medium ${comic.status === 'ongoing' ? 'text-green-400' : 'text-blue-400'}`}>
              {comic.status === 'ongoing' ? 'Ongoing' : 'Completed'}
            </span>
          </div>
          
          {/* Genres/Categories */}
          <div className="flex flex-wrap gap-2 mt-2">
            {comic.genres.map((genre, index) => (
              <Link 
                key={index}
                to={`/the-loai/${genre.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full text-sm transition-colors"
                tabIndex={0}
                aria-label={`View ${genre} comics`}
              >
                {genre}
              </Link>
            ))}
          </div>
          
          {/* Description */}
          {comic.content && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <div 
                className="text-neutral-300 text-sm" 
                dangerouslySetInnerHTML={{ __html: comic.content }}
              />
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">

          {latestChapter && (
              <Link
                to={`/truyen-tranh/${comic.slug}/chapter/${latestChapter.name}`}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:text-white text-white rounded-md transition-colors"
                tabIndex={0}
                aria-label="Read latest chapter"
              >
                 Đọc từ đầu
               
              </Link>
            )}

            {firstChapter && (
              <Link
                to={`/truyen-tranh/${comic.slug}/chapter/${firstChapter.name}`}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
                tabIndex={0}
                aria-label="Read from the beginning"
              >
                Đọc tập mới nhất
              </Link>
            )}
            
         
            
            <button
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:text-white text-white rounded-md transition-colors"
              tabIndex={0}
              aria-label="Continue reading"
              disabled
            >
              Đọc tiếp
            </button>
            
            <button
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 dark:text-white text-white rounded-md transition-colors"
              tabIndex={0}
              aria-label="Follow this comic"
              disabled
            >
              Theo dõi
            </button>
          </div>
        </div>
      </div>
      
      {/* Chapters List */}
      <div className="mt-8" id="chapters-section">
        <h2 className="text-2xl font-bold mb-4">Chapters</h2>
        
        {/* Chapter Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="flex items-center text-neutral-400 dark:text-neutral-400">Chapters:</span>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const firstChapterIndex = (page - 1) * chaptersPerPage;
              const lastChapterIndex = Math.min(page * chaptersPerPage - 1, totalChapters - 1);
              const fromChapter = allChapters[lastChapterIndex]?.name || '';
              const toChapter = allChapters[firstChapterIndex]?.name || '';
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page 
                      ? 'bg-primary text-primary-foreground dark:text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground dark:text-secondary-foreground'
                  }`}
                  tabIndex={0}
                >
                  {toChapter} - {fromChapter}
                </button>
              );
            })}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {currentChapters.map((chapter, index) => (
            <Link
              key={`chapter-${startIndex + index}`}
              to={`/truyen-tranh/${comic.slug}/chapter/${chapter.name}`}
              className="px-4 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors flex items-center justify-between"
              tabIndex={0}
              aria-label={`Read chapter ${chapter.name}`}
            >
              <span className="font-medium">Chapter {chapter.name}</span>
              {chapter.title && <span className="text-muted-foreground text-sm truncate ml-2">{chapter.title}</span>}
            </Link>
          ))}
        </div>
        
       
      </div>
    </div>
  );
};

export default ComicDetail;
