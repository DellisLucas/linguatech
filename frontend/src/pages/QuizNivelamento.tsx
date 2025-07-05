import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import QuizOption from "@/components/QuizOption";
import LevelIndicator from "@/components/LevelIndicator";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { fetchPlacementQuestions } from "@/services/nivelamentoQuiz";
import { fetchAiExplanation, Question, sendPlacementResult } from "@/services/quizService";
import { updateStreak } from "@/services/streakService";

const QuizNivelamento = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ questionId: number; selectedOption: string }[]>([]);


  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const fetchedQuestions = await fetchPlacementQuestions();
        
        // Embaralha apenas as alternativas de cada questão
        const questionsWithShuffledOptions = fetchedQuestions.map(q => ({
          ...q,
          options: q.options.sort(() => Math.random() - 0.5)
        }));
        
        setQuestions(questionsWithShuffledOptions);
      } catch (error) {
        console.error("Erro ao carregar perguntas:", error);
        toast({
          title: "Erro ao carregar perguntas",
          description: "Não foi possível carregar as perguntas de Boas Vindas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

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
    const isCorrect = selectedOption === correctOption?.id;

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
  };

  const nextQuestion = async () => {
    const respostaAtual = {
      questionId: currentQuestion.id,
      selectedOption: selectedOption || "",
    };
  
    if (currentQuestionIndex < questions.length - 1) {
      setAnswers((prev) => [...prev, respostaAtual]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      const todasRespostas = [...answers, respostaAtual];
  
      const respostasCorretas = todasRespostas
      .filter((r) => {
        const questao = questions.find((q) => q.id === r.questionId);
        const opcao = questao?.options.find((o) => o.id === r.selectedOption);
        return opcao?.correct;
      })
      .map((r) => {
        const questao = questions.find((q) => q.id === r.questionId);
        return {
          question_id: r.questionId,
          level: questao?.level ?? 1,
        };
      });

      // Coleta as questões erradas
      const wrongQuestions = todasRespostas
        .filter((r) => {
          const questao = questions.find((q) => q.id === r.questionId);
          const opcao = questao?.options.find((o) => o.id === r.selectedOption);
          return !opcao?.correct;
        })
        .map((r) => {
          const questao = questions.find((q) => q.id === r.questionId);
          const opcaoCorreta = questao?.options.find((o) => o.correct);
          const opcaoSelecionada = questao?.options.find((o) => o.id === r.selectedOption);
          return {
            question: questao?.question || "",
            correctAnswer: opcaoCorreta?.text || "",
            userAnswer: opcaoSelecionada?.text || "",
            level: questao?.level || 1
          };
        });
  
      try {
        const userId = Number(localStorage.getItem("user_id"));
        const result = await sendPlacementResult(userId, respostasCorretas);
  
        // Atualiza o placement_level no localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.placement_level = String(result.placement_level);
        localStorage.setItem("user", JSON.stringify(user));
  
        // Dispara evento para notificar outros componentes
        window.dispatchEvent(new Event('storage'));
        
        const score = respostasCorretas.length;
        const total = questions.length;
        const percentage = Math.round((score / total) * 100);
        
        await updateStreak();

        // Adiciona as questões erradas à URL
        const wrongQuestionsParam = encodeURIComponent(JSON.stringify(wrongQuestions));
        setTimeout(() => {
          navigate(`/results?score=${score}&total=${total}&percentage=${percentage}&fromNivelamento=1&wrongQuestions=${wrongQuestionsParam}`);
        }, 1500);
  
      } catch (error) {
        toast({
          title: "Erro ao classificar usuário",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    }
  };
  

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
            <p className="text-xl">Nenhuma pergunta de Boas Vindas.</p>
            <Button onClick={() => navigate("/")}>
              Voltar para Início
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Quiz de Boas Vindas</h1>

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

export default QuizNivelamento;
