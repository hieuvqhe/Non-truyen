import  { useEffect } from 'react'
import CircularGallery from '../../components/CircularGallery'
import useComicStore from '../../store/comicStore'
import NewComic from '../NewComic';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { homeComics, isLoadingHomeComics, fetchHomeComics } = useComicStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomeComics();
  }, [fetchHomeComics]);

  const truncateText = (text: string | undefined, maxLength: number = 20): string => {
    if (!text) return 'Comic';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const galleryItems = homeComics.map(comic => ({
    image: comic.thumbnail || 'https://picsum.photos/seed/placeholder/800/600',
    text: truncateText(comic.title),
    slug: comic.slug,
  }));

  const handleItemClick = (index: number) => {
    const N = homeComics.length;
    if (N === 0) return;
    const selectedIndex = index % N;
    const selectedComic = homeComics[selectedIndex];
    if (selectedComic && selectedComic.slug) {
      navigate(`/truyen-tranh/${selectedComic.slug}`);
    }
  };

  if (isLoadingHomeComics) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-xl">Loading comics...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 pb-16">
      <div className="h-[600px] relative">
        <CircularGallery 
          items={galleryItems} 
          bend={0.25} 
          borderRadius={0.05}
          font="bold 28px Quicksand"
          onItemClick={handleItemClick}
        />
       
      </div>

      <div className="relative">
        <NewComic/>
      </div>
    </div>
  )
}

export default HomePage