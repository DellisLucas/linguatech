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
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const url = `${API_BASE_URL}/modules`;
    
    const response = await fetch(url, {
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

// Fetch single module details
export const fetchModuleDetails = async (moduleId: number): Promise<ModuleDetail> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const url = `${API_BASE_URL}/modules/${moduleId}`;
    
    const response = await fetch(url, {
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

// Fetch categories for a specific module
export const fetchModuleCategories = async (moduleId: number): Promise<ModuleCategory[]> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const url = `${API_BASE_URL}/modules/${moduleId}/categories`;
    
    const response = await fetch(url, {
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

// Fetch progress for a specific category
export const fetchCategoryProgress = async (moduleId: number, categoryId: number): Promise<number> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return 0;
    }
    
    const response = await fetch(`${API_BASE_URL}/modules/${moduleId}/categories/${categoryId}/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error('Error response:', response.status, response.statusText);
      return 0;
    }
    
    const data = await response.json();
    return data.progress || 0;
  } catch (error) {
    console.error('Error fetching category progress:', error);
    return 0;
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