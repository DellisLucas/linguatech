
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getModules, Module, fetchModuleCategories } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";

const Modules = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModules = async () => {
      setLoading(true);
      try {
        const fetchedModules = await getModules();
        setModules(fetchedModules);
      } catch (error) {
        console.error("Failed to load modules:", error);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Módulos de Aprendizado</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white shadow-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-2 w-full mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-32" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Módulos de Aprendizado</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="bg-white shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <ProgressBar current={module.progress} total={100} label="Progresso geral" />
                </div>
                
                <div className="space-y-4">
                  {module.categories.slice(0, 3).map((category) => (
                    <div 
                      key={category.id} 
                      className="cursor-pointer" 
                      onClick={() => navigate(`/modules/${module.id}/categories/`)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-xs text-gray-500">{category.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-linguatech-blue rounded-full" 
                          style={{ width: `${category.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  
                  {module.categories.length > 3 && (
                    <div className="text-sm text-linguatech-blue hover:underline cursor-pointer" 
                         onClick={() => navigate(`/modules/${module.id}/categories`)}>
                      Ver todas as {module.categories.length} categorias
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t border-gray-100">
                <Button 
                  variant="ghost"
                  className="text-linguatech-blue hover:underline font-medium"
                  onClick={() => navigate(`/modules/${module.id}/categories`)}
                >
                  Explorar módulo
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Modules;
