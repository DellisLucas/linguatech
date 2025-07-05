import { API_BASE_URL } from './apiUtils';

interface AIConfig {
  provider: 'gemini-free' | 'gemini-api';
  apiKey?: string;
  lastError?: {
    timestamp: number;
    message: string;
  };
  rateLimitReset?: number;
}

class AIService {
  private static instance: AIService;
  private config: AIConfig = {
    provider: 'gemini-free'
  };
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
  }

  private shouldSwitchToAPI(): boolean {
    if (!this.config.lastError) return false;
    
    const now = Date.now();
    // Se houve erro nos últimos 60 segundos
    if (now - this.config.lastError.timestamp < this.RATE_LIMIT_WINDOW) {
      return true;
    }
    
    return false;
  }

  private async callFreeGemini(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 429) { // Rate limit
          this.config.lastError = {
            timestamp: Date.now(),
            message: "Rate limit exceeded"
          };
          throw new Error("Rate limit exceeded");
        }
        throw new Error("API error");
      }

      return await response.json();
    } catch (error) {
      this.config.lastError = {
        timestamp: Date.now(),
        message: error.message
      };
      throw error;
    }
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error("API key not configured");
    }

    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.config.apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error("Gemini API error");
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      throw error;
    }
  }

  public async getExplanation(question: string, correctAnswer: string): Promise<string> {
    try {
      if (this.shouldSwitchToAPI() && this.config.apiKey) {
        // Se houve erro recente com Gemini gratuito e temos API key, usa a API
        const prompt = `Explique por que esta é a resposta correta para a pergunta:
Pergunta: ${question}
Resposta correta: ${correctAnswer}

Por favor, forneça uma explicação clara e didática.`;
        
        return await this.callGeminiAPI(prompt);
      } else {
        // Tenta usar o Gemini gratuito
        const data = await this.callFreeGemini("/explainer", {
          question,
          correct_answer: correctAnswer
        });
        return data.explanation;
      }
    } catch (error) {
      console.error("Erro ao obter explicação:", error);
      return "Não foi possível gerar uma explicação no momento.";
    }
  }
}

export const aiService = AIService.getInstance(); 