import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, Trophy } from "lucide-react";
import { QuizResult } from "@/services";

const QuizResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<QuizResult>({
    score: 0,
    total: 0,
    percentage: 0,
    feedback: ""
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const scoreParam = parseInt(searchParams.get("score") || "0");
    const totalParam = parseInt(searchParams.get("total") || "1");
    const percentageParam = parseInt(searchParams.get("percentage") || "0");
    
    // Calculate percentage if not provided from backend
    const calculatedPercentage = percentageParam || Math.round((scoreParam / totalParam) * 100);
    
    // Generate feedback based on score if not provided from backend
    let feedback = searchParams.get("feedback") || "";
    if (!feedback) {
      if (calculatedPercentage >= 80) {
        feedback = "Excelente! Você dominou esse conteúdo.";
      } else if (calculatedPercentage >= 60) {
        feedback = "Bom trabalho! Você está no caminho certo.";
      } else {
        feedback = "Continue praticando. A prática leva à perfeição!";
      }
    }
    
    setResult({
      score: scoreParam,
      total: totalParam,
      percentage: calculatedPercentage,
      feedback
    });
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-linguatech-blue mb-4">
              {result.percentage >= 70 ? (
                <Trophy className="h-10 w-10" />
              ) : (
                <Award className="h-10 w-10" />
              )}
            </div>
            <h1 className="text-2xl font-bold">Resultado do Quiz</h1>
          </div>
          
          <div className="text-center mb-8">
            <div className="text-5xl font-bold mb-2">{result.percentage}%</div>
            <p className="text-gray-600">Você acertou {result.score} de {result.total} questões</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
            <p className="text-center text-blue-800">{result.feedback}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="border-linguatech-blue text-linguatech-blue hover:bg-blue-50"
              onClick={() => navigate("/")}
            >
              Voltar para o Início
            </Button>
            <Button 
              className="bg-linguatech-blue hover:bg-blue-700"
              onClick={() => navigate("/modules")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Continuar Aprendendo
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizResults;
