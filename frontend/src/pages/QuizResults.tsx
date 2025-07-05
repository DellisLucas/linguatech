import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, Trophy, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { QuizResult } from "@/services";
import { API_BASE_URL } from "@/services/apiUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface WrongQuestion {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  aiExplanation: string;
  vocabulary: string[];
  tips: string[];
  activity?: string;
}

interface EnhancedQuizResult extends QuizResult {
  wrongQuestions: WrongQuestion[];
}

const QuizResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [result, setResult] = useState<EnhancedQuizResult>({
    score: 0,
    total: 0,
    percentage: 0,
    feedback: "",
    wrongQuestions: []
  });
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const fromNivelamento = searchParams.get("fromNivelamento") === "1";

  useEffect(() => {
    // Log do estado inicial
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
    const token = localStorage.getItem("token");
    console.log('Estado inicial:', {
      isLoggedIn: !!token,
      user,
      placementLevel: user?.placement_level,
      currentPath: location.pathname
    });
  }, [location]);

  const handleModulesClick = () => {
    navigate('/modules');
  };

  const addLog = (message: string) => {
    setLoadingLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  useEffect(() => {
    const fetchResults = async () => {
      const searchParams = new URLSearchParams(location.search);
      const scoreParam = parseInt(searchParams.get("score") || "0");
      const totalParam = parseInt(searchParams.get("total") || "1");
      const percentageParam = parseInt(searchParams.get("percentage") || "0");
      const wrongQuestionsParam = searchParams.get("wrongQuestions");
      
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

      // Parse wrong questions if available
      const wrongQuestions = wrongQuestionsParam ? JSON.parse(wrongQuestionsParam) : [];
      
      setResult({
        score: scoreParam,
        total: totalParam,
        percentage: calculatedPercentage,
        feedback,
        wrongQuestions: []
      });

      // Se houver questões erradas, buscar as revisões
      if (wrongQuestions.length > 0) {
        setIsLoading(true);
        setLoadingStep("Analisando suas respostas...");
        setProgress(0);
        setLoadingLogs([]);
        
        try {
          addLog('Iniciando análise das respostas...');
          
          // Simula progresso durante a análise
          const progressInterval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 100) {
                clearInterval(progressInterval);
                return 100;
              }
              return prev + 1;
            });
          }, 50);

          setTimeout(() => {
            setLoadingStep("Gerando explicações personalizadas...");
            setProgress(35);
            addLog('Gerando explicações personalizadas...');
          }, 1000);
          
          addLog('Enviando requisição para a API...');
          const response = await fetch(`${API_BASE_URL}/review`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ questions: wrongQuestions })
          });

          if (!response.ok) {
            throw new Error('Erro ao buscar revisões');
          }

          addLog('Resposta recebida da API, processando dados...');
          setTimeout(() => {
            setLoadingStep("Preparando sua revisão...");
            setProgress(70);
            addLog('Preparando revisão personalizada...');
          }, 2000);

          const data = await response.json();
          addLog('Dados processados com sucesso!');
          
          if (!data.reviews || data.reviews.length === 0) {
            throw new Error('Nenhuma revisão recebida');
          }

          setProgress(100);
          addLog('Revisão pronta!');
          
          setResult(prev => ({
            ...prev,
            wrongQuestions: data.reviews
          }));
        } catch (error) {
          addLog(`Erro: ${error.message}`);
          // Em caso de erro, usar as questões originais sem revisão
          setResult(prev => ({
            ...prev,
            wrongQuestions
          }));
        } finally {
          setIsLoading(false);
          setLoadingStep("");
          setProgress(0);
        }
      }
    };

    fetchResults();
  }, [location.search]);

  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const handleIndexClick = () => {
    if (fromNivelamento) {
      setShowSurveyModal(true);
    } else {
      const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
      if (user?.placement_level) {
        window.location.href = '/index';
      } else {
        navigate('/index');
      }
    }
  };

  return (
    <>
      <Dialog open={showSurveyModal} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajude-nos a melhorar!</DialogTitle>
          </DialogHeader>
          <p>
            Por favor, responda nosso questionário de satisfação. Sua opinião é muito importante para nós!
          </p>
          <DialogFooter>
  <Button
    className="w-full"
    autoFocus
    onClick={() => {
      window.open("https://forms.office.com/r/NL7u1MZuHA", "_blank", "noopener,noreferrer");
      setShowSurveyModal(false);
      setTimeout(() => {
        const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
        if (user?.placement_level) {
          window.location.href = '/index';
        } else {
          navigate('/index');
        }
      }, 300); // Pequeno delay para garantir a abertura da nova aba
    }}
  >
    Responder
  </Button>
</DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 shadow-xl">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-linguatech-blue border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-white"></div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-4 w-full">
                    <p className="text-lg font-medium text-linguatech-blue">{loadingStep}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-linguatech-blue h-2.5 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500">Isso pode levar alguns segundos...</p>
                    
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto text-left">
                      <p className="text-sm font-medium text-gray-700 mb-2">Log de Atualizações:</p>
                      {loadingLogs.map((log, index) => (
                        <p key={index} className="text-xs text-gray-600 mb-1">{log}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

            {result.wrongQuestions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Revisão das Questões</h2>
                <div className="space-y-4">
                  {result.wrongQuestions.map((question, index) => (
                    <div key={index} className="border rounded-lg">
                      <button
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
                        onClick={() => toggleQuestion(index)}
                      >
                        <span className="font-medium">Questão {index + 1}</span>
                        {expandedQuestion === index ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      
                      {expandedQuestion === index && (
                        <div className="p-4 border-t bg-gray-50">
                          <div className="mb-4">
                            <p className="font-medium mb-2">{question.question}</p>
                            <div className="flex gap-4">
                              <p className="text-red-600">❌ {question.userAnswer}</p>
                              <p className="text-green-600">✅ {question.correctAnswer}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <div className="prose prose-sm max-w-none">
                                <div className="space-y-6">
                                  {question.aiExplanation.split('\n\n').map((section, idx) => {
                                    // Remove espaços extras e quebras de linha no início e fim
                                    const cleanSection = section.trim();
                                    
                                    // Verifica se a seção começa com algum dos títulos conhecidos
                                    const titleMatch = cleanSection.match(/^(Explicação|Vocabulário|Dicas|Atividade|aiExplanation:|vocabulary:|tips:|activity:)/i);
                                    if (titleMatch) {
                                      const title = titleMatch[0].replace(/[:]/g, '');
                                      const content = cleanSection.replace(titleMatch[0], '').trim();
                                      
                                      return (
                                        <div key={idx} className="space-y-2">
                                          <h3 className="font-medium text-linguatech-blue">{title}</h3>
                                          <div className="space-y-3">
                                            {content.split('\n').map((line, i) => {
                                              // Se a linha contém "Example:" ou "Tradução:", formata como vocabulário
                                              if (line.includes('Example:') || line.includes('Tradução:')) {
                                                const [label, text] = line.split(':');
                                                return (
                                                  <div key={i} className="flex gap-2">
                                                    <span className="text-linguatech-blue">{label}:</span>
                                                    <p className="text-gray-700">{text}</p>
                                                  </div>
                                                );
                                              }
                                              // Se a linha contém " - ", formata como termo de vocabulário
                                              if (line.includes(' - ')) {
                                                const [term, translation] = line.split(' - ');
                                                return (
                                                  <div key={i} className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="font-medium text-gray-800">{term}</p>
                                                    <p className="text-gray-700">{translation}</p>
                                                  </div>
                                                );
                                              }
                                              // Linha normal
                                              return <p key={i} className="text-gray-700">{line}</p>;
                                            })}
                                          </div>
                                        </div>
                                      );
                                    }
                                    
                                    // Se não encontrar um título conhecido, exibe como texto normal
                                    return <p key={idx} className="text-gray-700">{cleanSection}</p>;
                                  })}
                                </div>
                              </div>
                            </div>

                            {question.vocabulary && question.vocabulary.length > 0 && (
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="font-medium text-linguatech-blue mb-3 flex items-center">
                                  <span className="mr-2">📚</span> Vocabulário
                                </h3>
                                <div className="space-y-4">
                                  {question.vocabulary.map((word, idx) => {
                                    const [term, ...rest] = word.split(' - ');
                                    const content = rest.join(' - ');
                                    const [example, translation] = content.split(' Tradução:');
                                    
                                    return (
                                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                        <p className="font-medium text-gray-800 mb-2">{term}</p>
                                        <div className="space-y-2">
                                          <div className="flex gap-2">
                                            <span className="text-linguatech-blue">EN:</span>
                                            <p className="text-gray-700">{example}</p>
                                          </div>
                                          <div className="flex gap-2">
                                            <span className="text-linguatech-blue">PT:</span>
                                            <p className="text-gray-700">{translation}</p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {question.tips && question.tips.length > 0 && (
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="font-medium text-linguatech-blue mb-3 flex items-center">
                                  <span className="mr-2">💡</span> Dicas
                                </h3>
                                <div className="space-y-3">
                                  {question.tips.map((tip, idx) => (
                                    <div key={idx} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                                      <span className="text-linguatech-blue mt-1">•</span>
                                      <p className="text-gray-700">{tip}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                className="border-linguatech-blue text-linguatech-blue hover:bg-blue-50 w-full"
                onClick={handleIndexClick}
              >
                Voltar para o Início
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default QuizResults;
