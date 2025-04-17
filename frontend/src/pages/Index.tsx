import { useEffect, useState } from "react";
import { Clock, Award, CheckCircle, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import LearningCard from "@/components/LearningCard";
import WeekProgress from "@/components/WeekProgress";
import { getModules } from "@/services/modulesService";// Importando a função que busca os módulos da API

const Index = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<any[]>([]);
  const [userStats] = useState({
    studyTime: "45 min",
    currentStreak: 3,
    completedLessons: "2/15",
    points: "320 XP"
  });

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await getModules(); // Apenas aguarde os dados retornados
  
        if (Array.isArray(data)) {
          setModules(data);
        } else {
          console.error("Dados inesperados da API:", data);
          setModules([]);
        }
      } catch (error) {
        console.error("Erro ao buscar módulos:", error);
        setModules([]);
      }
    };
  
    fetchModules();
  }, []);
  

  const handleStartQuiz = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Bem-vindo ao LinguaTech!</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatsCard 
            icon={<Clock className="h-5 w-5" />} 
            label="Tempo de Estudo" 
            value={userStats.studyTime}
            subtext="Hoje"
            trend={{ value: "+12% dos últimos 7 dias", isPositive: true }}
          />
          <StatsCard 
            icon={<Flame className="h-5 w-5" />} 
            label="Sequência Atual" 
            value={`${userStats.currentStreak} dias`}
            trend={{ value: "+50% dos últimos 7 dias", isPositive: true }}
          />
          <StatsCard 
            icon={<CheckCircle className="h-5 w-5" />} 
            label="Lições Completas" 
            value={userStats.completedLessons}
          />
          <StatsCard 
            icon={<Award className="h-5 w-5" />} 
            label="Pontos Acumulados" 
            value={userStats.points}
            trend={{ value: "+8% dos últimos 7 dias", isPositive: true }}
          />
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Continue Aprendendo</h2>
        
        {/* Learning Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <LearningCard 
            title="Nivelamento" 
            description="Teste seu conhecimento inicial e descubra o melhor caminho para sua jornada de aprendizado!"
            onContinue={() => handleStartQuiz("/quiznivelamento")}
          />
          <LearningCard 
            title="Aprendizado" 
            description="Explore e aprimore suas habilidades com módulos focados em áreas essenciais de TI"
            onContinue={() => handleStartQuiz("/modules")}
          />
          <WeekProgress currentStreak={userStats.currentStreak} record={7} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Módulos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module) => (
                <div 
                  key={module.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/modules/${module.id}/categories`)}
                >
                  <h3 className="font-semibold mb-1">{module.title}</h3>
                  <p className="text-sm text-gray-500">{module.description}</p>
                </div>
              ))}
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
