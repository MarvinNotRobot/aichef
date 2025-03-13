import type { Recipe, Ingredient, Unit } from './database.types';

export interface CostSummary {
  foodCost: number;
  materialCost: number;
  materialCostPercentage: number;
  overheadCost: number;
  overheadCostPercentage: number;
  totalCost: number;
  grossProfit: number;
  grossProfitPercentage: number;
}

export interface IngredientFormData {
  name: string;
  description?: string;
  defaultUnit: string;
  price: number;
  supplier?: string;
  notes?: string;
}

export interface RecipeFormData {
  name: string;
  category: string;
  isActive: boolean;
  isTaxable: boolean;
  servingSize?: number;
  servingUnit?: string;
  price?: number;
  notes?: string;
  instructions?: string;
}

export interface RecipeIngredientFormData {
  ingredientId: string;
  quantity: number;
  unitId: string;
  notes?: string;
}

export interface TableIngredient extends Ingredient {
  currentPrice?: number;
  defaultUnit?: Unit;
}

export interface TableRecipeIngredient {
  ingredient: Ingredient;
  quantity: number;
  unit: Unit;
  unitCost: number;
  totalCost: number;
  costPercentage: number;
  notes?: string;
}