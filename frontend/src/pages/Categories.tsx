import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchModuleCategories, ModuleCategory, fetchModuleDetails, ModuleDetail } from "@/services/modulesService";
import { fetchQuestionsByLevel } from "@/services/quizService";
import { BookOpen, Video, FileText, ArrowLeft } from "lucide-react";


const Categories = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ModuleCategory[]>([]);
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!moduleId) return;
      
      setLoading(true);
      try {
        const [moduleData, categoriesData] = await Promise.all([
          fetchModuleDetails(parseInt(moduleId)),
          fetchModuleCategories(parseInt(moduleId))
        ]);
        
        setModule(moduleData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [moduleId]);

  const renderCategoryIcon = (icon: string | undefined) => {
    switch(icon) {
      case 'book':
        return <BookOpen className="h-6 w-6 text-white" />;
      case 'video':
        return <Video className="h-6 w-6 text-white" />;
      case 'file':
        return <FileText className="h-6 w-6 text-white" />;
      default:
        return <BookOpen className="h-6 w-6 text-white" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-xl">Carregando categorias...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!module) {
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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-gray-500 mb-4 cursor-pointer" onClick={() => navigate("/modules")}>
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Módulos</span>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
            <p className="text-gray-600">{module.description}</p>
          </div>
          
          <div className="mb-8">
          <label className="block mb-2 text-sm font-medium text-gray-700">Escolha a quantidade de questões:</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="border rounded px-4 py-2 w-full"
      >
        <option value="">Selecione</option>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
        <option value="25">25</option>
        <option value="30">30</option>
      </select>
      <Button
  className="mt-5 bg-linguatech-blue hover:bg-blue-700 w-full"
  onClick={async () => {
    if (!selected || !moduleId) {
      alert("Selecione a quantidade de questões.");
      return;
    }

    try {
      const userId = Number(localStorage.getItem("user_id"));
      const quantity = parseInt(selected);

      const questions = await fetchQuestionsByLevel(
        parseInt(moduleId),
        userId,
        quantity // agora não é mais necessário enviar o nível
      );

      if (!questions || questions.length === 0) {
        alert("Nenhuma pergunta encontrada para esse nível.");
        return;
      }

      localStorage.setItem("quiz_questions", JSON.stringify(questions));
      navigate(`/quiz/module/${moduleId}/custom`);
    } catch (error) {
      console.error("Erro ao buscar perguntas:", error);
      alert("Erro ao buscar perguntas.");
    }
  }}
>
  Iniciar Formulário
</Button>

            <h2 className="mt-10 text-2xl font-bold mb-6">Categorias</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/module/${moduleId}/category/${category.id}`)}
                >
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${category.bgColor || 'bg-linguatech-blue'}`}>
                      {renderCategoryIcon(category.icon)}
                    </div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linguatech-blue rounded-full" 
                        style={{ width: `${category.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">Progresso</span>
                      <span className="text-sm font-medium">{category.progress}%</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="text-linguatech-blue hover:bg-blue-700">
                      Explorar categoria
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Categories;
