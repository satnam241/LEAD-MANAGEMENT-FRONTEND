import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const ProtectedRoute = ({ children, onLogout }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      onLogout();
      navigate("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        sessionStorage.removeItem("token");
        onLogout();
        navigate("/");
      }
    } catch {
      sessionStorage.removeItem("token");
      onLogout();
      navigate("/");
    }
  }, [navigate, onLogout]);

  return <>{children}</>;
};

export default ProtectedRoute;
