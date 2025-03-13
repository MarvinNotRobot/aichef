import type { User } from '@supabase/supabase-js';
import type { Recipe, Ingredient, Unit, IngredientPrice } from './database.types';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
}

export interface IngredientState {
  ingredients: Ingredient[];
  prices: IngredientPrice[];
  units: Unit[];
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  isSidebarOpen: boolean;
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>;
}