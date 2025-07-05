
import { handleApiError, API_BASE_URL } from './apiUtils';

export interface UserStats {
  studyTime: string;
  currentStreak: number;
  completedLessons: string;
  points: string;
  weeklyProgress: number[];
  totalModules: number; 
  recordStreak: number;
}

export interface LearningCard {
  id: number;
  title: string;
  description: string;
  path: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  bgColor: string;
  icon: string;
}

export interface HomeData {
  userStats: UserStats;
  learningCards: LearningCard[];
  categories: Category[];
}

// Fetch home data including stats, learning cards and categories
export const fetchHomeData = async (): Promise<HomeData> => {
  try {
    const url = `${API_BASE_URL}/home`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};
