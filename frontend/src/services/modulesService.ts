import { handleApiError, API_BASE_URL } from './apiUtils';

export interface Lesson {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  duration: string;
  contentType: 'video' | 'text' | 'quiz';
}

export interface ModuleCategory {
  id: number;
  name: string;
  description: string;
  progress: number;
  lessons: Lesson[];
  bgColor?: string;
  icon?: string;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  progress: number;
  categories: {
    id: number;
    name: string;
    progress: number;
  }[];
}

export interface ModuleDetail extends Module {
  overview: string;
  prerequisites: string[];
  estimatedHours: number;
  categories: ModuleCategory[];
}

// Fetch all available modules
export const getModules = async (): Promise<Module[]> => {
  try {
    const url = `${API_BASE_URL}/modules`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Fetch single module details
export const fetchModuleDetails = async (moduleId: number): Promise<ModuleDetail> => {
  try {
    const url = `${API_BASE_URL}/modules/${moduleId}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Fetch categories for a specific module
export const fetchModuleCategories = async (moduleId: number): Promise<ModuleCategory[]> => {
  try {
    const url = `${API_BASE_URL}/modules/${moduleId}/categories`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Mark a lesson as completed
export const markLessonAsCompleted = async (lessonId: number): Promise<{ success: boolean }> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const url = `${API_BASE_URL}/lessons/${lessonId}/complete`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};