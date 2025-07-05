export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  placement_level: string | null;
  created_at: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
} 