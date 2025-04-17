import { handleApiError, API_BASE_URL } from './apiUtils';
import { Question } from './quizService';


export const fetchPlacementQuestions = async (): Promise<Question[]> => {
    try {
      const url = `${API_BASE_URL}/nivelamento`;
  
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  };

export {  };
  