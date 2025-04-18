import { BookOpen, Home, Layers, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-linguatech-blue">
          <BookOpen className="h-6 w-6" />
          <span>LinguaTech</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link 
            to="/index" 
            className={`flex items-center gap-1 hover:text-linguatech-blue ${
              isActive('/index') ? 'text-linguatech-blue' : 'text-gray-700'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link 
            to="/profile" 
            className={`flex items-center gap-1 hover:text-linguatech-blue ${
              isActive('/profile') ? 'text-linguatech-blue' : 'text-gray-700'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">Perfil</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
