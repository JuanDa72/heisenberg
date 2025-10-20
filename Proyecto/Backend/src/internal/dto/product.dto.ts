export default interface ProductDTO {
  id?: number;
  name: string;
  type: string;
  use_case: string;
  warnings: string;
  contraindications: string;
  expiration_date: string;
  price: number;
  stock: number;
  created_at: Date;
};
