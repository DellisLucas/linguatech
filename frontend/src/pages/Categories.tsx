import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchModuleCategories, ModuleCategory, fetchModuleDetails, ModuleDetail, fetchCategoryProgress } from "@/services/modulesService";
import { fetchQuestionsByLevel } from "@/services/quizService";
import { BookOpen, Video, FileText, ArrowLeft } from "lucide-react";
import CategoryCard from '../components/CategoryCard';

const Categories: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [categories, setCategories] = useState<ModuleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const moduleData = await fetchModuleDetails(Number(moduleId));
        const categoriesData = await fetchModuleCategories(Number(moduleId));
        setModule(moduleData);
        setCategories(categoriesData);

        // Atualiza o progresso de cada categoria
        const updatedCategories = await Promise.all(
          categoriesData.map(async (category) => {
            const progress = await fetchCategoryProgress(Number(moduleId), category.id);
            return { ...category, progress };
          })
        );
        
        setCategories(updatedCategories);
      } catch (err) {
        setError('Failed to load module data');
        console.error(err);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-xl">{error}</p>
            <Button onClick={() => navigate("/modules")}>
              Voltar para Módulos
            </Button>
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
          <div className="flex items-center gap-2 text-gray-500 mb-4 cursor-pointer" onClick={() => navigate("/index")}>
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Home</span>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
            <p className="text-gray-600">{module.description}</p>
          </div>
          
          <div className="mb-8">
            <Button
              className="mt-5 bg-linguatech-blue hover:bg-blue-700 w-full"
              onClick={async () => {
                if (!moduleId) {
                  alert("Erro ao identificar o módulo.");
                  return;
                }

                try {
                  const userId = Number(localStorage.getItem("user_id"));
                  const quantity = 10; // Quantidade fixa de questões

                  const questions = await fetchQuestionsByLevel(
                    Number(moduleId),
                    userId,
                    quantity
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
                <CategoryCard
                  key={category.id}
                  category={category}
                  moduleId={Number(moduleId)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Categories;
