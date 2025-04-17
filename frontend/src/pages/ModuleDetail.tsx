
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Check, BookOpen, FileText, Video, PlayCircle } from "lucide-react";
import { fetchModuleDetails, ModuleDetail, Lesson } from "@/services";

const ModuleDetailPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [moduleDetail, setModuleDetail] = useState<ModuleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadModuleDetails = async () => {
      if (!moduleId) return;
      
      setLoading(true);
      try {
        const details = await fetchModuleDetails(parseInt(moduleId));
        setModuleDetail(details);
      } catch (error) {
        console.error("Failed to load module details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadModuleDetails();
  }, [moduleId]);
  
  const getLessonIcon = (lesson: Lesson) => {
    switch (lesson.contentType) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'quiz':
        return <FileText className="w-4 h-4" />;
      case 'text':
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-xl">Carregando detalhes do módulo...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!moduleDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-xl">Módulo não encontrado.</p>
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-gray-500 mb-4 cursor-pointer" onClick={() => navigate("/modules")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Voltar para Módulos</span>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{moduleDetail.title}</h1>
            <p className="text-gray-600 mb-4">{moduleDetail.description}</p>
            
            <div className="mb-4">
              <ProgressBar current={moduleDetail.progress} total={100} label={`Progresso: ${moduleDetail.progress}%`} />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Pré-requisitos</div>
                <div className="font-medium">
                  {moduleDetail.prerequisites.length > 0 
                    ? moduleDetail.prerequisites.join(", ") 
                    : "Nenhum"}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Categorias</div>
                <div className="font-medium">{moduleDetail.categories.length}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Tempo estimado</div>
                <div className="font-medium">{moduleDetail.estimatedHours} horas</div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Sobre este Módulo</h2>
              <p className="text-gray-600 mb-4">{moduleDetail.overview}</p>
              
              <h3 className="text-lg font-semibold mt-6 mb-3">O que você vai aprender</h3>
              <ul className="space-y-2">
                {moduleDetail.categories.map(category => (
                  <li key={category.id} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span>{category.name}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="content">
              <div className="space-y-6">
                {moduleDetail.categories.map(category => (
                  <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold mb-2">{category.name}</h2>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      
                      <div className="mb-4">
                        <ProgressBar current={category.progress} total={100} label={`Progresso: ${category.progress}%`} />
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-4">
                        {category.lessons.map(lesson => (
                          <div 
                            key={lesson.id}
                            className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                            onClick={() => navigate(`/lesson/${lesson.id}`)}
                          >
                            <div className="flex items-center">
                              <div className="mr-3 text-linguatech-blue">
                                {getLessonIcon(lesson)}
                              </div>
                              <div>
                                <h3 className="font-medium">{lesson.title}</h3>
                                <p className="text-sm text-gray-500">{lesson.duration}</p>
                              </div>
                            </div>
                            
                            {lesson.completed ? (
                              <div className="flex items-center text-green-500">
                                <Check className="w-5 h-5 mr-1" />
                                <span className="text-sm">Concluído</span>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="text-linguatech-blue">
                                <PlayCircle className="w-4 h-4 mr-1" />
                                Iniciar
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ModuleDetailPage;
