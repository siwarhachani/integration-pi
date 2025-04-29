export type ProductCategory = 'ALIMENTAIRE' | 'SPORTIF' |  'AUTRE';

export interface Product {
    id?: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl: string;
    category: ProductCategory;

  }
  