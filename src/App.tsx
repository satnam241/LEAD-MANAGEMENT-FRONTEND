import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface JWTPayload {
  id: string;
  role: string;
  exp: number;
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Check token validity on load
  useEffect(() => {
    const token = sessionStorage.getItem("token"); // 🔥 sessionStorage instead of localStorage
    if (token) {
      try {
        const decoded: JWTPayload = jwtDecode(token);

        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        sessionStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  // ✅ When login succeeds
  const handleLogin = (token: string) => {
    sessionStorage.setItem("token", token); // 🔥 sessionStorage
    setIsAuthenticated(true);
  };

  // ✅ Logout
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  // ✅ Loader while checking auth state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ✅ Home/Login Route */}
            <Route
              path="/"
              element={
                !isAuthenticated ? (
                  <Login onLogin={handleLogin} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />

            {/* ✅ Protected Dashboard */}
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <AdminDashboard onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
