import { useEffect, useState } from "react";
import { Clock, Award, CheckCircle, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import LearningCard from "@/components/LearningCard";
import WeekProgress from "@/components/WeekProgress";
import { getModules } from "@/services/modulesService";
import { getStreak } from "@/services/streakService";
import { getUserAnswersStats } from "@/services/userService";

const Index = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<any[]>([]);
  const [streakData, setStreakData] = useState({
    current_streak: 0,
    record_streak: 0,
    weekly_progress: [0,0,0,0,0,0,0]
  });
  const [userStats] = useState({
    studyTime: "45 min",
    completedLessons: "2/15",
    points: "320 XP"
  });
  const [answersStats, setAnswersStats] = useState({ total: 0, correct: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Busca módulos
        const modulesData = await getModules();
        const userId = localStorage.getItem("user_id");
        let stats = { total: 0, correct: 0 };
        if (userId) {
          stats = await getUserAnswersStats(Number(userId));
        }
        setAnswersStats(stats);
        if (Array.isArray(modulesData)) {
          setModules(modulesData);
        }

        const streak = await getStreak();
        setStreakData(streak);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
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
            subtext="Em Desenvolvimento"
          />
          <StatsCard 
            icon={<Flame className="h-5 w-5" />} 
            label="Sequência Atual" 
            value={`${streakData.current_streak} dias`}
          />
          <StatsCard 
            icon={<CheckCircle className="h-5 w-5" />} 
            label="Questões Respondidas" 
            value={`${answersStats.correct}/${answersStats.total}`}
          />
          <StatsCard 
            icon={<Award className="h-5 w-5" />} 
            label="Pontos Acumulados" 
            value={userStats.points}
            subtext="Em Desenvolvimento"
          />
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Continue Aprendendo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <LearningCard 
            title="Boas Vindas" 
            description="Teste seu conhecimento inicial e descubra o que o nosso sistema pode fazer!"
            onContinue={() => handleStartQuiz("/quiznivelamento")}
          />
          <LearningCard 
            title="Aprendizado" 
            description="Explore e aprimore suas habilidades com módulos focados em áreas essenciais de TI"
            onContinue={() => handleStartQuiz("/modules")}
          />
          <WeekProgress 
            currentStreak={streakData.current_streak} 
            record={streakData.record_streak}
            weeklyProgress={streakData.weekly_progress}
          />
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
