
import { handleApiError, API_BASE_URL } from './apiUtils';

export interface LessonContent {
  id: number;
  title: string;
  description: string;
  contentType: 'video' | 'text' | 'quiz';
  content: string; // HTML content for text lessons, video URL for video lessons
  duration: string;
  moduleId: number;
  categoryId: number;
  nextLessonId: number | null;
  previousLessonId: number | null;
}

// Fetch lesson content
export const fetchLessonContent = async (lessonId: number): Promise<LessonContent> => {
  try {
    const url = `${API_BASE_URL}/lessons/${lessonId}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Track lesson progress
export const trackLessonProgress = async (lessonId: number, progress: number): Promise<{ success: boolean }> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const url = `${API_BASE_URL}/lessons/${lessonId}/progress`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ progress })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};
