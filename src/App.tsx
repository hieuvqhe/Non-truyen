import MainLayout from "./components/layout/MainLayout"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import path from "./constants/path"
import HomePage from "./pages/HomePage"
import ComicDetail from "./pages/ComicDetail"
import ChapterDetail from "./pages/ChapterDetail"
import CategoryPage from "./pages/Category/CategoryPage" 
import SearchPage from "./pages/SearchPage/SearchPage" // Import SearchPage

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="container mx-auto">
          <Toaster />
          <MainLayout>
            <Routes>
              <Route path={path.home} element={<HomePage />} />
              <Route path="/the-loai/:slug" element={<CategoryPage />} /> 
              <Route path="/truyen-tranh/:slug" element={<ComicDetail />} />
              <Route path="/truyen-tranh/:slug/chapter/:chapterName" element={<ChapterDetail />} />
              <Route path="/search" element={<SearchPage />} /> {/* Add search route */}
            </Routes>
          </MainLayout>
        </div>
      </ThemeProvider>
    </Router>
  )
}

export default App
