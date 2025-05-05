export interface BaseProduct {
  id: string;
  title: string;
  type: 'fish' | 'accessories' | 'food';
  price: number;
  stock_quantity: number;
  image_url?: string;
  video_url?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  category: string;
}

export interface FishProduct extends BaseProduct {
  origin: any;
  type: 'fish';
  species: string;
  size: string;
  category: string;
  // Add category field
}

export interface AccessoryProduct extends BaseProduct {
  compatibility: any;
  material: any;
  dimensions: any;
  type: 'accessories';
  brand?: string;
  category: string; // Add category field
}

export interface FoodProduct extends BaseProduct {
  feeding_instructions: any;
  suitable_for: any;
  weight: any;
  type: 'food';
  brand?: string;
  category: string; // Add category field
}

export type Product = FishProduct | AccessoryProduct | FoodProduct;

export const isProductType = (type: string): type is 'fish' | 'accessories' | 'food' => {
  return ['fish', 'accessories', 'food'].includes(type);
};

export const PRODUCT_CATEGORIES = {
  FISH: ['Arowana', 'Discus', 'Silver Dollar'],
  ACCESSORIES: ['Accessories'],
  FOOD: ['Fish Food']
} as const;
