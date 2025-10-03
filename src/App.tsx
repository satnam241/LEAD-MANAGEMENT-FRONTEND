import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {jwtDecode}from "jwt-decode";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import NotFound from "./pages/NotFound";
import { toast } from "sonner";

const queryClient = new QueryClient();

interface JWTPayload {
  id: string;
  role: string;
  exp: number;
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token"); // ✅ sessionStorage
    if (token) {
      try {
        const decoded: JWTPayload = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem("token");
          setIsAuthenticated(false);
          toast.error("Session expired. Please login again.");
        }
      } catch (err) {
        console.error("Invalid token:", err);
        sessionStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (token: string) => {
    sessionStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    toast.success("Logged out successfully.");
  };

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
