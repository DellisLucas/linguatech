
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { fetchLessonContent, markLessonAsCompleted, LessonContent } from "@/services";

const Lesson = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  
  useEffect(() => {
    const loadLessonContent = async () => {
      if (!lessonId) return;
      
      setLoading(true);
      try {
        const content = await fetchLessonContent(parseInt(lessonId));
        setLesson(content);
      } catch (error) {
        console.error("Failed to load lesson content:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLessonContent();
  }, [lessonId]);
  
  const handleMarkCompleted = async () => {
    if (!lesson) return;
    
    setIsCompleting(true);
    try {
      await markLessonAsCompleted(lesson.id);
      
      // Navigate to the next lesson if available
      if (lesson.nextLessonId) {
        navigate(`/lesson/${lesson.nextLessonId}`);
      } else {
        // Navigate back to the module detail page
        navigate(`/module/${lesson.moduleId}`);
      }
    } catch (error) {
      console.error("Failed to mark lesson as completed:", error);
    } finally {
      setIsCompleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-xl">Carregando conteúdo da lição...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-xl">Lição não encontrada.</p>
            <Button onClick={() => navigate("/modules")}>
              Voltar para Módulos
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
          <div className="flex items-center gap-2 text-gray-500 mb-4 cursor-pointer" onClick={() => navigate(`/module/${lesson.moduleId}`)}>
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o Módulo</span>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-gray-600 mb-4">{lesson.description}</p>
            <div className="text-sm text-gray-500 mb-6">Duração estimada: {lesson.duration}</div>
            
            {lesson.contentType === 'text' && (
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }}></div>
            )}
            
            {lesson.contentType === 'video' && (
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <iframe 
                  className="w-full h-[400px] rounded-lg"
                  src={lesson.content}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            {lesson.contentType === 'quiz' && (
              <div className="text-center py-6">
                <p className="mb-4">Este conteúdo contém um quiz para testar seus conhecimentos.</p>
                <Button onClick={() => navigate(`/quiz/lesson/${lesson.id}`)}>
                  Iniciar Quiz
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            {lesson.previousLessonId ? (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/lesson/${lesson.previousLessonId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Lição Anterior
              </Button>
            ) : (
              <div></div>
            )}
            
            <Button 
              onClick={handleMarkCompleted}
              disabled={isCompleting}
              className="bg-linguatech-green hover:bg-green-700 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {lesson.nextLessonId ? "Concluir e Avançar" : "Concluir Lição"}
              {lesson.nextLessonId && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lesson;
