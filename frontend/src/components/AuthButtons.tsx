
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

const AuthButtons = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  
  // Check auth status on mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const hasToken = localStorage.getItem("token") !== null;
      setIsLoggedIn(hasToken);
      
      if (hasToken) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUserName(userData.name || "");
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
      }
    };
    
    // Initial check
    checkAuthStatus();
    
    // Listen for storage events (when localStorage changes)
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    toast.success("Logout realizado com sucesso!");
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    navigate("/login");
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-4">
        {userName && <span className="text-sm">Olá, {userName}!</span>}
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Button asChild variant="outline">
        <Link to="/login">
          <LogIn className="mr-2 h-4 w-4" />
          Entrar
        </Link>
      </Button>
      <Button asChild>
        <Link to="/register">
          <UserPlus className="mr-2 h-4 w-4" />
          Registrar
        </Link>
      </Button>
    </div>
  );
};

export default AuthButtons;
