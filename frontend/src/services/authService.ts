import { handleApiError, API_BASE_URL } from './apiUtils';
import { RegisterUserData } from '@/types/user';

// User authentication interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  placement_level: string | null;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Register a new user
export const registerUser = async (userData: RegisterUserData): Promise<AuthResponse> => {
  try {
    console.log(`Attempting to register user at ${API_BASE_URL}/register`);
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || `Registration failed with status: ${response.status}`);
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Login user
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log(`Attempting to login user at ${API_BASE_URL}/login`);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || `Login failed with status: ${response.status}`);
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
