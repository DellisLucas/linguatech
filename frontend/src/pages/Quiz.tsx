import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import QuizOption from "@/components/QuizOption";
import LevelIndicator from "@/components/LevelIndicator";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { fetchQuizQuestions, submitQuizAnswers } from "@/services";
import { fetchAiExplanation, Question, sendPlacementResult } from "@/services/quizService";
import { updateStreak } from "@/services/streakService";

const Quiz = () => {
  const navigate = useNavigate();
  const { topic, moduleId, categoryId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ questionId: number; selectedOption: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("quiz_questions");

        let fetchedQuestions;
        if (stored) {
          fetchedQuestions = JSON.parse(stored);
          localStorage.removeItem("quiz_questions");
        } else {
          fetchedQuestions = await fetchQuizQuestions(
            topic,
            moduleId ? parseInt(moduleId) : undefined,
            categoryId ? parseInt(categoryId) : undefined
          );
        }

        // Padroniza as opções e faz log para debug
        const normalizedQuestions = fetchedQuestions.map(q => ({
          ...q,
          options: q.options.map(opt => {
            const mapped = {
              id: String(opt.id ?? opt.option_id),
              text: opt.text,
              correct: Boolean(opt.correct ?? opt.is_correct),
            };
            return mapped;
          }),
        }));

        // Embaralha as questões
        const shuffledQuestions = [...normalizedQuestions].sort(() => Math.random() - 0.5);
        
        setQuestions(shuffledQuestions);
      } catch (error) {
        toast({
          title: "Erro ao carregar perguntas",
          description: "Não foi possível carregar as perguntas do quiz.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [topic, moduleId, categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-xl">Carregando perguntas...</p>
          </div>
        </main>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-xl">Nenhuma pergunta encontrada para este tópico.</p>
            <Button onClick={() => navigate("/modules")}>
              Voltar para Módulos
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionId: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(optionId);
  };

  const checkAnswer = () => {
    if (!selectedOption) {
      toast({
        title: "Selecione uma opção",
        description: "Você precisa selecionar uma resposta antes de verificar.",
        variant: "destructive"
      });
      return;
    }

    setIsAnswerChecked(true);

    const correctOption = currentQuestion.options.find(option => option.correct);
    // Garante comparação por string
    const isCorrect = String(selectedOption) === String(correctOption?.id);

        if (isCorrect) {
          setScore(score + 1);
          toast({
            title: "Resposta correta!",
            variant: "default",
          });
        } else {
            toast({
                title: "Resposta incorreta",
                description: "Buscando explicação da IA...",
                variant: "destructive",
                duration: 20000,
              });
              
              fetchAiExplanation(currentQuestion.question, correctOption?.text || "")
                .then((iaExplanation) => {
                  toast({
                    title: "Explicação da IA",
                    description: iaExplanation,
                    variant: "default",
                    duration: 25000,
                  });
                });
        }

    setAnswers([...answers, { questionId: currentQuestion.id, selectedOption }]);
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      try {
        const result = await submitQuizAnswers(
          [...answers, { questionId: currentQuestion.id, selectedOption: selectedOption || "" }],
          topic,
          moduleId ? parseInt(moduleId) : undefined,
          categoryId ? parseInt(categoryId) : undefined
        );

        // Coleta as questões erradas
        const wrongQuestions = questions
          .map((question, index) => {
            const userAnswer = answers[index]?.selectedOption;
            const correctOption = question.options.find(opt => opt.correct);
            
            if (userAnswer !== correctOption?.id) {
              return {
                question: question.question,
                correctAnswer: correctOption?.text || "",
                userAnswer: question.options.find(opt => opt.id === userAnswer)?.text || "",
                level: question.level
              };
            }
            return null;
          })
          .filter(Boolean);

        // Codifica as questões erradas para a URL
        const wrongQuestionsParam = encodeURIComponent(JSON.stringify(wrongQuestions));

        navigate(`/results?score=${result.score}&total=${result.total}&percentage=${result.percentage}&wrongQuestions=${wrongQuestionsParam}`);
        await updateStreak();
      } catch (error) {
        console.error("Error submitting quiz:", error);
        navigate(`/results?score=${score}&total=${questions.length}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">{currentQuestion.module}</h1>

          <div className="flex items-center justify-between mb-4">
            <ProgressBar
              current={currentQuestionIndex + 1}
              total={questions.length}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Nível:</span>
              <LevelIndicator level={currentQuestion.level} className="w-8 h-8 text-sm" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <h2 className="text-xl font-medium mb-6">{currentQuestion.question}</h2>

            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option) => (
                <QuizOption
                  key={option.id}
                  text={option.text}
                  selected={selectedOption === option.id}
                  correct={isAnswerChecked ? option.correct || false : null}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={isAnswerChecked}
                />
              ))}
            </div>

            {!isAnswerChecked ? (
              <Button
                className="bg-linguatech-blue hover:bg-blue-700 w-full"
                onClick={checkAnswer}
              >
                Verificar
              </Button>
            ) : (
              <Button
                className="bg-linguatech-green hover:bg-green-700 w-full"
                onClick={nextQuestion}
              >
                {currentQuestionIndex < questions.length - 1 ? "Próxima Questão" : "Ver Resultados"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Quiz;