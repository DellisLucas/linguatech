
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import QuizResults from "./pages/QuizResults";
import Modules from "./pages/Modules";
import Categories from "./pages/Categories";
import ModuleDetail from "./pages/ModuleDetail";
import Lesson from "./pages/Lesson";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import QuizNivelamento from "./pages/QuizNivelamento";

const queryClient = new QueryClient();

const App = () => {
  // Check if user is already logged in
  const isLoggedIn = localStorage.getItem("token") !== null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect from root to login or index */}
            <Route path="/" element={isLoggedIn ? <Navigate to="/index" /> : <Navigate to="/login" />} />
            
            {/* Auth routes - accessible without login */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes - redirect to login if not authenticated */}
            <Route path="/index" element={isLoggedIn ? <Index /> : <Navigate to="/login" />} />
            <Route path="/quiz" element={isLoggedIn ? <Quiz /> : <Navigate to="/login" />} />
            <Route path="/quiznivelamento" element={isLoggedIn ? <QuizNivelamento /> : <Navigate to="/login" />} />
            <Route path="/quiz/module/:moduleId/category/:categoryId" element={isLoggedIn ? <Quiz /> : <Navigate to="/login" />} />
            <Route path="/quiz/lesson/:lessonId" element={isLoggedIn ? <Quiz /> : <Navigate to="/login" />} />
            <Route path="/results" element={isLoggedIn ? <QuizResults /> : <Navigate to="/login" />} />
            <Route path="/modules" element={isLoggedIn ? <Modules /> : <Navigate to="/login" />} />
            <Route path="/module/:moduleId" element={isLoggedIn ? <ModuleDetail /> : <Navigate to="/login" />} />
            <Route path="/module/:moduleId" element={isLoggedIn ? <ModuleDetail /> : <Navigate to="/login" />} />
            <Route path="/modules/:moduleId/categories" element={isLoggedIn ? <Categories /> : <Navigate to="/login" />} />
            <Route path="/module/:moduleId/category/:categoryId" element={isLoggedIn ? <ModuleDetail /> : <Navigate to="/login" />} />
            <Route path="/questions/by-level" element={isLoggedIn ? <Quiz /> : <Navigate to="/login" />} />
            <Route path="/lesson/:lessonId" element={isLoggedIn ? <Lesson /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/quiz/module/:moduleId/custom" element={isLoggedIn ? <Quiz /> : <Navigate to="/login" />} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
