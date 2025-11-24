// Tipos para Users basados en el Backend DTO
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_verified?: boolean;
  provider?: string;
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

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: string;
  is_verified?: boolean;
}

export interface PasswordUpdateRequest {
  current_password: string;
  new_password: string;
}

// Alias para compatibilidad con el backend
export type CreateUserDTO = CreateUserRequest;
export type UpdateUserDTO = UpdateUserRequest;
export type PasswordUpdateDTO = PasswordUpdateRequest;

export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}
