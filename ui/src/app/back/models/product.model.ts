export interface Product {
  id: number;
  code: string;
  name: string;
  retailPrice: number;
  wholesalePrice: number;
  maxStock: number;
  minStock: number;
  currentStock: number;
  photo: string | null; // base64 encoded
  categoryId: number | null;
  categoryName: string | null;
}

export interface ProductCategory {
  id: number;
  code: string;
  name: string;
  photo: string | null; // base64 encoded
}
