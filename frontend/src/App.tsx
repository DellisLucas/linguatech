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
import RedirectWithToast from "./components/RedirectWithToast";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota raiz - redireciona com base no status de autenticação e nivelamento */}
            <Route 
              path="/" 
              element={
                isLoggedIn 
                  ? <Navigate to="/index" />
                  : <Navigate to="/login" />
              } 
            />
            
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Quiz de nivelamento - requer apenas login */}
            <Route 
  path="/quiznivelamento" 
  element={
    isLoggedIn 
      ? (hasPlacementLevel 
          ? <RedirectWithToast to="/index" message="Questionário já respondido" /> 
          : <QuizNivelamento />)
      : <Navigate to="/login" />
  }
/>

            {/* Rotas protegidas - requerem login e nivelamento */}
            <Route 
              path="/index" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <Index /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/quiz" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <Quiz /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/quiz/module/:moduleId/category/:categoryId" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <Quiz /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/quiz/lesson/:lessonId" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <Quiz /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/results" 
              element={
                isLoggedIn 
                    ? <QuizResults />
                    : <Navigate to="/login" />
              } 
/>
            <Route 
              path="/modules" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <Modules /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/module/:moduleId" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <ModuleDetail /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/modules/:moduleId/categories" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <Categories /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/module/:moduleId/category/:categoryId" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <ModuleDetail /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/questions/by-level" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <Quiz /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/lesson/:lessonId" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <Lesson /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/profile" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <Profile /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/quiz/module/:moduleId/custom" 
              element={
                isLoggedIn 
                  ? (hasPlacementLevel ? <Quiz /> : <Navigate to="/quiznivelamento" />)
                  : <Navigate to="/login" />
              } 
            />

            {/* Rota para página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
