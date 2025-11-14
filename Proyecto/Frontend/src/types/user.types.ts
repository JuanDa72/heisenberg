// Tipos para Users basados en el Backend DTO
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  message: string;
  data?: User;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}
