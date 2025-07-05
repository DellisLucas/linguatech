import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { aiService } from '@/services/aiService';

const AISettings = () => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    try {
      if (apiKey.trim()) {
        aiService.setApiKey(apiKey.trim());
        localStorage.setItem('gemini_api_key', apiKey.trim());
        toast({
          title: "Configuração salva",
          description: "A chave da API foi salva com sucesso.",
          variant: "default",
        });
      } else {
        toast({
          title: "Chave inválida",
          description: "Por favor, insira uma chave de API válida.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a chave da API.",
        variant: "destructive",
      });
    }
  };

  // Carrega a chave salva ao montar o componente
  useState(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      aiService.setApiKey(savedKey);
    }
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Configurações da IA</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chave da API do Gemini
          </label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Cole sua chave da API aqui"
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Será usada como fallback quando o serviço gratuito estiver indisponível
          </p>
        </div>
        <Button onClick={handleSave} className="w-full">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default AISettings; 