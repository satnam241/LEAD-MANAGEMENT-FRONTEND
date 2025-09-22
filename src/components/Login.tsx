import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Building2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface LoginProps {
  onLogin: (token: string) => void;
}

interface JWTPayload {
  id: string;
  role: string;
  exp: number;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = () => {
    sessionStorage.removeItem("token"); // 🔥 sessionStorage
    toast({
      title: "Session Expired",
      description: "Please login again",
      variant: "destructive",
    });
    navigate("/"); // back to login
  };

  const scheduleAutoLogout = (token: string) => {
    try {
      const decoded: JWTPayload = jwtDecode(token);
      const expiresIn = decoded.exp * 1000 - Date.now();

      if (expiresIn <= 0) {
        logout();
      } else {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          logout();
        }, expiresIn);
      }
    } catch (err) {
      console.error("JWT decode error:", err);
      logout();
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      scheduleAutoLogout(token);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4520/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        onLogin(data.token); // 🔥 parent (App.tsx) will store in sessionStorage

        toast({
          title: "Login Successful",
          description: "Welcome to the Lead Management Dashboard",
        });

        scheduleAutoLogout(data.token);
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Server Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Lead Management
          </CardTitle>
          <p className="text-gray-500 text-center">
            Sign in to access your dashboard
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
