import { handleApiError, API_BASE_URL } from './apiUtils';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  level: number;
  points: number;
  createdAt: string;
  completedModules: number;
  completedLessons: number;
}

// Fetch the current user's profile data
export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const url = `${API_BASE_URL}/user/profile`;
    
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

// Update user profile
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const url = `${API_BASE_URL}/user/profile`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUserAnswersStats = async (userId: number): Promise<{ total: number, correct: number }> => {
  const url = `${API_BASE_URL}/user-answers/stats/${userId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erro ao buscar estatísticas');
  return await response.json();
};