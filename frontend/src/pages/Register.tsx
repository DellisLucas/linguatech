import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/Navbar_Login";
import { registerUser } from "@/services";
import { toast } from "sonner";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return email.endsWith('@fatec.sp.gov.br');
  };

  const getErrorMessage = (err: any): string => {
    // Erro de conexão com o servidor
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return "Não foi possível conectar ao servidor. Por favor, verifique sua conexão com a internet e tente novamente.";
    }

    // Erro de resposta da API
    if (err.response) {
      const status = err.response.status;
      switch (status) {
        case 400:
          return "Dados inválidos. Por favor, verifique se todos os campos estão preenchidos corretamente.";
        case 409:
          return "Este email já está cadastrado. Por favor, use outro email ou faça login.";
        case 422:
          return "Dados inválidos. Por favor, verifique o formato do email e da senha.";
        case 500:
          return "Erro interno do servidor. Por favor, tente novamente mais tarde.";
        default:
          return `Erro ${status}: ${err.response.data?.message || 'Ocorreu um erro ao fazer o registro.'}`;
      }
    }

    // Erro de validação
    if (err.message?.includes('validation')) {
      return "Por favor, preencha todos os campos corretamente.";
    }

    // Erro de timeout
    if (err.message?.includes('timeout')) {
      return "O servidor demorou muito para responder. Por favor, tente novamente.";
    }

    // Erro genérico
    return "Ocorreu um erro ao fazer o registro. Por favor, tente novamente.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateEmail(email)) {
      setError("Por favor, use um email válido do domínio @fatec.sp.gov.br");
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser({ name, email, password });
      
      if (response.token.includes('mock')) {
        toast.info("Registro simulado (API não disponível). Redirecionando para login...");
      } else {
        toast.success("Registro realizado com sucesso! Por favor, faça login.");
      }
      
      navigate("/login");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="João Silva"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@fatec.sp.gov.br"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
    </div>
  );
};

export default Register;
