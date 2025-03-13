// Database types generated from schema
export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  base_unit?: string;
  conversion_factor: number;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  default_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface IngredientPrice {
  id: string;
  ingredient_id: string;
  unit_id: string;
  price: number;
  supplier?: string;
  notes?: string;
  effective_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  version: number;
  is_active: boolean;
  is_taxable: boolean;
  serving_size?: number;
  serving_unit?: string;
  price?: number;
  food_cost?: number;
  material_cost?: number;
  overhead_cost?: number;
  total_cost?: number;
  gross_profit?: number;
  notes?: string;
  instructions?: string;
  instruction?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit_id: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RecipePhoto {
  id: string;
  recipe_id: string;
  file_name: string;
  storage_path: string;
  url?: string; // Added for UI convenience
  is_primary: boolean;
  is_ai_generated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}