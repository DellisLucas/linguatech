import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { User, Award, Clock, BookOpen, LogOut } from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { fetchUserProfile, updateUserProfile, UserProfile, getUserAnswersStats } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }).optional(),
});

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lessonStats, setLessonStats] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const userData = await fetchUserProfile();
        setProfile(userData);
        form.reset({
          name: userData.name,
          email: userData.email,
        });
        // Buscar estatísticas de lições
        const userId = localStorage.getItem("user_id");
        if (userId) {
          const stats = await getUserAnswersStats(Number(userId));
          setLessonStats(stats);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [form]);
  
  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const updatedProfile = await updateUserProfile({
        name: values.name,
      });
      
      setProfile(updatedProfile);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao atualizar suas informações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-xl">Carregando perfil...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-xl">Perfil não encontrado.</p>
            <Button onClick={() => navigate("/")}>
              Voltar para o Início
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                <User className="w-12 h-12" />
              </div>
              
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-gray-600 mb-2">{profile.email}</p>
                
                <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
                  
                  <div className="bg-green-50 p-3 rounded-lg flex items-center">
                    <BookOpen className="w-5 h-5 text-green-500 mr-2" />
                    <div>
                      <div className="text-sm text-gray-500">Lições</div>
                      <div className="font-medium">{lessonStats.correct}/{lessonStats.total} concluídas</div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg flex items-center">
                    <Clock className="w-5 h-5 text-purple-500 mr-2" />
                    <div>
                      <div className="text-sm text-gray-500">Desde</div>
                      <div className="font-medium">{new Date(profile.createdAt).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="account">
            <TabsList className="mb-6">
              <TabsTrigger value="account">Conta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Informações da Conta</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </form>
              </Form>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Sair da conta</h3>
                <p className="text-gray-600 mb-4">
                  Clique no botão abaixo para sair da sua conta. Você precisará fazer login novamente para acessar o sistema.
                </p>
                <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="achievements" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Suas Conquistas</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${index < 2 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${index < 2 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">{index === 0 ? 'Primeiro Módulo' : index === 1 ? '10 Lições Concluídas' : `Conquista ${index + 1}`}</h3>
                    <p className="text-sm text-gray-500">{index < 2 ? 'Conquistado em ' + new Date().toLocaleDateString('pt-BR') : 'Ainda não conquistado'}</p>
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

export default ProfilePage;
