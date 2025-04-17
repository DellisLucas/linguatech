
import { handleApiError, API_BASE_URL } from './apiUtils';

export interface Question {
  id: number;
  question: string;
  options: {
    is_correct: boolean;
    option_id: string;
    id: string;
    text: string;
    correct?: boolean;
  }[];
  module: string;
  level: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  feedback: string;
}

// Fetch quiz questions based on topic or module/category
export const fetchQuizQuestions = async (
  topic?: string,
  moduleId?: number,
  categoryId?: number
): Promise<Question[]> => {
  try {
    let url = `${API_BASE_URL}/questions`;
    
    // Add query parameters based on what's provided
    const params = new URLSearchParams();
    if (topic) params.append("topic", topic);
    if (moduleId) params.append("moduleId", moduleId.toString());
    if (categoryId) params.append("categoryId", categoryId.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Submit quiz answers and get results
export const submitQuizAnswers = async (
  answers: { questionId: number; selectedOption: string }[],
  topic?: string,
  moduleId?: number,
  categoryId?: number
): Promise<QuizResult> => {
  try {
    const url = `${API_BASE_URL}/submit-quiz`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers,
        topic,
        moduleId,
        categoryId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchQuestionsByCategory = async (categoryId: number): Promise<Question[]> => {
  try {
    const url = `${API_BASE_URL}/api/questions/category/${categoryId}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};


export const fetchQuestionsByLevel = async (
  module_id: number,
  user_id: number,
  quantity: number
): Promise<Question[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/by-level`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        module_id,
        user_id,
        quantity,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchAiExplanation = async (question: string, correctAnswer: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/explainer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, correct_answer: correctAnswer }),
    });

    if (!response.ok) throw new Error("Erro ao obter explicação da IA");

    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error("Erro na explicação IA:", error);
    return "Não foi possível gerar uma explicação no momento.";
  }
};


export const sendPlacementResult = async (
  userId: number,
  respostas: { question_id: number; level: number }[]
): Promise<{ placement_level: number; nivel_texto: string }> => {
  try {
    console.log("🔍 Enviando para /api/nivelamento/resultado:", {
      user_id: userId,
      respostas
    });
    const response = await fetch(`${API_BASE_URL}/nivelamento/resultado`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, respostas }),
    });

    if (!response.ok) throw new Error("Erro ao enviar resultado de nivelamento");

    return await response.json();
  } catch (error) {
    console.error("Erro ao enviar placement:", error);
    throw error;
  }
};
