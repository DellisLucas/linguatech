import { handleApiError, API_BASE_URL } from './apiUtils';

export interface StreakData {
  current_streak: number;
  record_streak: number;
  weekly_progress: number[];
}

export const getStreak = async (): Promise<StreakData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/streak`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch streak data');
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateStreak = async (): Promise<StreakData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/streak/update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to update streak');
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};
