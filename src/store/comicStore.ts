import { create } from 'zustand';
import comicApi from '../apis/comic.api';
import { Comic, ComicCarousel, ChapterDetail } from '../types/Comic.type';

interface ComicState {
  // Home comics
  homeComics: ComicCarousel[];
  isLoadingHomeComics: boolean;
  
  // Genre comics
  genreComics: ComicCarousel[];
  currentGenre: string | null;
  currentPage: number;
  isLoadingGenreComics: boolean;
  
  // Search results
  searchResults: ComicCarousel[];
  isLoadingSearch: boolean;
  currentSearchKeyword: string | null;
  currentSearchPage: number;
  
  // Comic detail
  currentComic: Comic | null;
  isLoadingComicDetail: boolean;
  
  // Chapter detail
  currentChapter: ChapterDetail | null;
  isLoadingChapter: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchHomeComics: () => Promise<void>;
  fetchComicsByGenre: (genre: string, page?: number) => Promise<void>;
  fetchComicDetail: (slug: string) => Promise<void>;
  fetchChapterDetail: (chapterUrl: string) => Promise<void>;
  fetchSearchResults: (keyword: string, page?: number) => Promise<void>;
  
  // UI helpers
  resetError: () => void;
  resetState: () => void;
}

const useComicStore = create<ComicState>((set) => ({
  // Initial state
  homeComics: [],
  isLoadingHomeComics: false,
  
  genreComics: [],
  currentGenre: null,
  currentPage: 1,
  isLoadingGenreComics: false,
  
  searchResults: [],
  isLoadingSearch: false,
  currentSearchKeyword: null,
  currentSearchPage: 1,
  
  currentComic: null,
  isLoadingComicDetail: false,
  
  currentChapter: null,
  isLoadingChapter: false,
  
  error: null,
  
  // Actions
  fetchHomeComics: async () => {
    try {
      set({ isLoadingHomeComics: true, error: null });
      const comics = await comicApi.getHome();
      set({ homeComics: comics, isLoadingHomeComics: false });
    } catch (error) {
      set({ 
        isLoadingHomeComics: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch home comics' 
      });
    }
  },
  
  fetchComicsByGenre: async (genre: string, page: number = 1) => {
    try {
      set({ isLoadingGenreComics: true, error: null });
      const comics = await comicApi.getByGenre(genre, page);
      set({ 
        genreComics: comics, 
        isLoadingGenreComics: false,
        currentGenre: genre,
        currentPage: page
      });
    } catch (error) {
      set({ 
        isLoadingGenreComics: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch comics by genre' 
      });
    }
  },
  
  fetchComicDetail: async (slug: string) => {
    try {
      set({ isLoadingComicDetail: true, error: null });
      const comic = await comicApi.getDetail(slug);
      set({ currentComic: comic, isLoadingComicDetail: false });
    } catch (error) {
      set({ 
        isLoadingComicDetail: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch comic details' 
      });
    }
  },
  
  fetchChapterDetail: async (chapterUrl: string) => {
    try {
      set({ isLoadingChapter: true, error: null });
      const chapter = await comicApi.getChapterDetail(chapterUrl);
      set({ currentChapter: chapter, isLoadingChapter: false });
    } catch (error) {
      set({ 
        isLoadingChapter: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch chapter details' 
      });
    }
  },
  
  fetchSearchResults: async (keyword: string, page: number = 1) => {
    try {
      set({ isLoadingSearch: true, error: null });
      const comics = await comicApi.search(keyword, page);
      set({ 
        searchResults: comics, 
        isLoadingSearch: false,
        currentSearchKeyword: keyword,
        currentSearchPage: page
      });
    } catch (error) {
      set({ 
        isLoadingSearch: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch search results' 
      });
    }
  },
  
  // UI helpers
  resetError: () => set({ error: null }),
  
  resetState: () => set({
    homeComics: [],
    genreComics: [],
    currentGenre: null,
    currentPage: 1,
    searchResults: [],
    currentSearchKeyword: null,
    currentSearchPage: 1,
    currentComic: null,
    currentChapter: null,
    error: null
  })
}));

export default useComicStore;
