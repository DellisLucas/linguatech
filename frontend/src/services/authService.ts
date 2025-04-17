
import { handleApiError, API_BASE_URL } from './apiUtils';

// User authentication interfaces
export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Register a new user
export const registerUser = async (userData: User): Promise<AuthResponse> => {
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
      throw new Error(errorData.message || `Registration failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
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
      throw new Error(errorData.message || `Login failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};
