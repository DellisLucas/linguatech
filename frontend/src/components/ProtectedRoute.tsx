import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePlacement?: boolean;
}

const ProtectedRoute = ({ children, requirePlacement = true }: ProtectedRouteProps) => {
  useEffect(() => {
    // Função para verificar expiração do token
    const checkTokenExpiration = () => {
      const expiry = localStorage.getItem("token_expiry");
      if (expiry && Date.now() > Number(expiry)) {
        localStorage.clear();
        window.location.href = "/login";
      }
    };

    // Verifica imediatamente ao carregar
    checkTokenExpiration();

    // Continua verificando a cada 5 segundos
    const interval = setInterval(checkTokenExpiration, 5000);

    return () => clearInterval(interval);
  }, []);

  const isLoggedIn = localStorage.getItem("token") !== null;
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const hasPlacementLevel = user?.placement_level === "10";

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (requirePlacement && !hasPlacementLevel) {
    return <Navigate to="/quiznivelamento" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 