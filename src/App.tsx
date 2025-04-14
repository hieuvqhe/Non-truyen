import MainLayout from "./components/layout/MainLayout";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import path from "./constants/path";
import HomePage from "./pages/HomePage";
import ComicDetail from "./pages/ComicDetail";
import ChapterDetail from "./pages/ChapterDetail";
import CategoryPage from "./pages/Category/CategoryPage";
import SearchPage from "./pages/SearchPage/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Profile from "./pages/ProfilePage/Profile";
import { ReactNode, useEffect, useState } from "react";
import ReadingPage from "./pages/IsReadingPage";
import Forgot from "./pages/ForgotPassword";
import Following from "./pages/FollowingPage";

// Protected Route component to check authentication
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("user");
      setIsAuthenticated(!!userData);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication
    return <div className="p-4 text-center">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

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
              <Route
                path="/truyen-tranh/:slug/chapter/:chapterName"
                element={<ChapterDetail />}
              />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<Forgot />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes - only accessible when logged in */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/readings"
                element={
                  <ProtectedRoute>
                    <ReadingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/follow"
                element={
                  <ProtectedRoute>
                    <Following />
                  </ProtectedRoute>
                }
              />

              {/* Add more protected routes here if needed */}
            </Routes>
          </MainLayout>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
