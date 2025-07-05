import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Navbar from "@/components/Navbar_Login";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginUser, User } from "@/services";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getErrorMessage = (err: any): string => {
    // Erro de conexão com o servidor
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return "Não foi possível conectar ao servidor. Por favor, verifique sua conexão com a internet e tente novamente.";
    }

    // Erro de resposta da API
    if (err.response) {
      const status = err.response.status;
      switch (status) {
        case 401:
          return "Email ou senha incorretos. Por favor, verifique suas credenciais.";
        case 403:
          return "Sua conta está bloqueada. Entre em contato com o suporte.";
        case 404:
          return "Usuário não encontrado. Verifique se o email está correto.";
        case 422:
          return "Dados inválidos. Por favor, verifique o formato do email.";
        case 500:
          return "Erro interno do servidor. Por favor, tente novamente mais tarde.";
        default:
          return `Erro ${status}: ${err.response.data?.message || 'Ocorreu um erro ao fazer login.'}`;
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
    return "Ocorreu um erro ao fazer login. Por favor, tente novamente.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(email, password);
      
      // Armazena token e usuário no localStorage
      const EXPIRATION_MINUTES = 60; // 1 hora
      const expiresAt = Date.now() + EXPIRATION_MINUTES * 60 * 1000;
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("user_id", String(response.user.id));
      localStorage.setItem("token_expiry", String(expiresAt));

      // Recarrega a aplicação para reavaliar login e redirecionar corretamente
      window.location.href = "/";

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
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
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
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Registre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
    </div>
  );
};

export default Login;
