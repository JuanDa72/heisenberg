// Tipos para Products basados en el Backend DTO
export interface Product {
  id: number;
  name: string;
  type: string;
  use_case: string;
  warnings: string;
  contraindications: string;
  expiration_date: string;
  price: number;
  stock: number;
  created_at: Date;
}

export interface CreateProductRequest {
  name: string;
  type: string;
  use_case: string;
  warnings: string;
  contraindications: string;
  expiration_date: string;
  price: number;
  stock: number;
}

export interface UpdateProductRequest {
  name?: string;
  type?: string;
  use_case?: string;
  warnings?: string;
  contraindications?: string;
  expiration_date?: string;
  price?: number;
  stock?: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}
