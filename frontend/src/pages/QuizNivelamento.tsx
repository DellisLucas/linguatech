import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import QuizOption from "@/components/QuizOption";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { fetchPlacementQuestions } from "@/services/nivelamentoQuiz";
import { fetchAiExplanation, Question, sendPlacementResult } from "@/services/quizService";

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

        const shuffledQuestions = fetchedQuestions
          .map((q) => ({
            ...q,
            options: q.options.sort(() => Math.random() - 0.5), // embaralha opções
          }))
          .sort(() => Math.random() - 0.5); // embaralha perguntas
        
        setQuestions(shuffledQuestions);
      } catch (error) {
        console.error("Erro ao carregar perguntas:", error);
        toast({
          title: "Erro ao carregar perguntas",
          description: "Não foi possível carregar as perguntas de nivelamento.",
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
        description: currentQuestion.explanation,
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
  
      try {
        const userId = Number(localStorage.getItem("user_id"));
        const result = await sendPlacementResult(userId, respostasCorretas);
  
        toast({
          title: "Classificação definida!",
          description: `Seu nível: ${result.nivel_texto} (nível ${result.placement_level})`,
        });
  
        navigate(
          `/results?score=${respostasCorretas.length}&total=${questions.length}&placement=${result.placement_level}`
        );
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
            <p className="text-xl">Nenhuma pergunta de nivelamento encontrada.</p>
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
          <h1 className="text-2xl font-bold mb-4">Teste de Nivelamento</h1>

          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questions.length}
            label={`Questão ${currentQuestionIndex + 1} de ${questions.length}`}
          />

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
