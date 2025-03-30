import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu'
import { ModeToggle } from '../../components/mode-toggle'
import { Input } from '../../components/ui/input'
import path from '../../constants/path'
import { Search, Menu, X, ArrowLeft, Bookmark, BookOpenCheck, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import useAuthStore from '../../store/authStore'
import categoryApi from '../../apis/category.api'
import { Category } from '../../types/Category.type'
import comicApi from '../../apis/comic.api'
import { ComicCarousel } from '../../types/Comic.type'
import useComicStore from '../../store/comicStore'
import { useDebounce } from '../../hooks/useDebounce'

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [quickResults, setQuickResults] = useState<ComicCarousel[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Debounce the search input to avoid making too many API calls
  const debouncedSearch = useDebounce(searchInput, 500)
  
  // Use the search function from comic store
  const { fetchSearchResults, resetState } = useComicStore()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll()
        setCategories(response.data.items)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [])
  
  // Fetch quick search results when debounced search value changes
  useEffect(() => {
    const fetchQuickSearchResults = async () => {
      if (!debouncedSearch.trim()) {
        setQuickResults([])
        return
      }
      
      try {
        setIsSearching(true)
        const results = await comicApi.search(debouncedSearch)
        // Only take the first 5 results for quick preview
        setQuickResults(results.slice(0, 5))
      } catch (error) {
        console.error('Failed to fetch search results:', error)
      } finally {
        setIsSearching(false)
      }
    }
    
    fetchQuickSearchResults()
  }, [debouncedSearch])

  const handleLogout = () => {
    logout()
    // Additional logic if needed
  }
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      // Fetch full search results and navigate to search page
      fetchSearchResults(searchInput)
      navigate(`/search?keyword=${encodeURIComponent(searchInput)}`)
      setSearchOpen(false)
      setSearchInput('')
    }
  }
  
  const handleComicClick = (slug: string) => {
    navigate(`/truyen-tranh/${slug}`)
    setSearchOpen(false)
    setSearchInput('')
  }

  if (searchOpen) {
    return (
      <header className='sticky top-0 z-50 w-full border-b bg-background'>
        <form onSubmit={handleSearchSubmit} className='container h-16'>
          <div className='flex h-full items-center px-4 sm:px-6 lg:px-8'>
            <Button 
              type="button"
              variant='ghost' 
              size='icon' 
              onClick={() => {
                setSearchOpen(false)
                setSearchInput('')
              }}
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div className='flex-1 mx-2 relative'>
              <Input 
                value={searchInput}
                onChange={handleSearchInputChange}
                placeholder="Nhập tên truyện để tìm..." 
                className="w-full" 
                autoFocus
              />
              
              {/* Quick search results dropdown */}
              {searchInput.trim() && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto'>
                  {isSearching ? (
                    <div className='p-4 text-center'>Đang tìm kiếm...</div>
                  ) : quickResults.length > 0 ? (
                    <>
                      {quickResults.map(comic => (
                        <div 
                          key={comic.id} 
                          className='p-2 hover:bg-accent flex items-center cursor-pointer'
                          onClick={() => handleComicClick(comic.slug)}
                        >
                          <div className='h-12 w-12 mr-3 overflow-hidden rounded'>
                            <img 
                              src={comic.thumbnail || 'https://placehold.co/48x48'} 
                              alt={comic.title} 
                              className='h-full w-full object-cover'
                            />
                          </div>
                          <div>
                            <div className='font-medium text-sm'>{comic.title}</div>
                            <div className='text-xs text-muted-foreground'>
                              Chap {comic.latestChapter?.chapterName || "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div 
                        className='p-2 text-center text-sm text-blue-600 hover:bg-accent cursor-pointer font-medium'
                        onClick={handleSearchSubmit}
                      >
                        Xem tất cả kết quả
                      </div>
                    </>
                  ) : (
                    <div className='p-4 text-center'>Không tìm thấy kết quả</div>
                  )}
                </div>
              )}
            </div>
            <Button type="submit" variant='ghost' size='icon'>
              <Search className='h-5 w-5' />
            </Button>
          </div>
        </form>
      </header>
    )
  }

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background'>
      <div className='container flex h-16 items-center px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center md:w-1/3'>
          <div className='md:hidden'>
            <Button variant='ghost' size='icon' onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
            </Button>
          </div>
          <div className='hidden md:flex md:items-center md:space-x-6'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm font-medium transition-colors hover:text-primary px-3 py-2">
                  Thể loại
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[600px] p-4">
                <div className="grid grid-cols-5 gap-3">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <Link 
                        key={category._id}
                        to={`/the-loai/${category.slug}`} 
                        className="px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-2 text-muted-foreground">Loading categories...</div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='flex flex-1 items-center justify-center'>
          <Link to={path.home} className='flex items-center space-x-2'>
            <BookOpenCheck  className='h-6 w-6 text-primary' />
            <span className='font-bold sm:inline-block'>NON TRUYỆN</span>
          </Link>
        </div>

        <div className='flex items-center md:w-1/3 justify-end gap-2'>

          <ModeToggle />
          
          <Button variant='ghost' size='icon' onClick={() => setSearchOpen(true)}>
            <Search className='h-5 w-5' />
          </Button>

          <Link to={path.orders}>
            <Button variant='ghost' size='icon'>
              <Bookmark className='h-5 w-5' />
            </Button>
          </Link>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={user.avatar || ""} alt={user.name || ""} />
                    <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                <div className='flex items-center justify-start gap-2 p-2'>
                  <div className='flex flex-col space-y-1 leading-none'>
                    <p className='font-medium'>{user.name || 'User'}</p>
                    <p className='text-xs text-muted-foreground'>{user.email || ''}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(path.profile)}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(path.orders)}>My Orders</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className='flex items-center space-x-2'>
              <Button variant='destructive' onClick={() => navigate(path.login)}>
                Đăng Nhập
              </Button>
              <Button onClick={() => navigate(path.register)}>Đăng Ký</Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='md:hidden'>
          <div className='space-y-2 px-4 py-3'>
            <div className="rounded-md px-3 py-2 text-base font-medium hover:bg-accent">
              <div className="font-medium mb-2">Thể loại</div>
              <div className="grid grid-cols-2 gap-1 pl-3">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/the-loai/${category.slug}`}
                      className="py-1 text-sm hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">Loading categories...</div>
                )}
              </div>
            </div>
            <Link
              to={path.healthAZ}
              className='block rounded-md px-3 py-2 text-base font-medium hover:bg-accent'
              onClick={() => setMobileMenuOpen(false)}
            >
              Health A-Z
            </Link>
            <Link
              to={path.medicines}
              className='block rounded-md px-3 py-2 text-base font-medium hover:bg-accent'
              onClick={() => setMobileMenuOpen(false)}
            >
              Drugs & Supplements
            </Link>
            <Link
              to={path.doctors}
              className='block rounded-md px-3 py-2 text-base font-medium hover:bg-accent'
              onClick={() => setMobileMenuOpen(false)}
            >
              Find a Doctor
            </Link>
            <Link
              to={path.feedback}
              className='block rounded-md px-3 py-2 text-base font-medium hover:bg-accent'
              onClick={() => setMobileMenuOpen(false)}
            >
              Feedback
            </Link>

            <div className='border-t pt-4'>
              {isAuthenticated && user ? (
                <>
                  <div className='flex items-center px-3 py-2'>
                    <Avatar className='h-8 w-8 mr-3'>
                      <AvatarImage src={user.avatar || ""} alt={user.name || ""} />
                      <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>{user.name || 'User'}</p>
                      <p className='text-xs text-muted-foreground'>{user.email || ''}</p>
                    </div>
                  </div>
                  <Link
                    to={path.profile}
                    className='block rounded-md px-3 py-2 text-base font-medium hover:bg-accent'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to={path.orders}
                    className='block rounded-md px-3 py-2 text-base font-medium hover:bg-accent'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    className='block w-full text-left rounded-md px-3 py-2 text-base font-medium hover:bg-accent'
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={path.login}
                    className='block rounded-md px-3 py-2 text-base font-medium hover:bg-accent'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to={path.register}
                    className='block rounded-md px-3 py-2 text-base font-medium hover:bg-accent'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
