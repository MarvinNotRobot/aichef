import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecipeIngredientsTab } from '../RecipeIngredientsTab';
import type { TableRecipeIngredient } from '../../../types';

// Mock the IngredientsTable component
vi.mock('../IngredientsTable', () => ({
  IngredientsTable: ({ ingredients }: { ingredients: TableRecipeIngredient[] }) => (
    <div data-testid="ingredients-table">
      {ingredients.map((ing, index) => (
        <div key={index} data-testid={`ingredient-${index}`}>
          {ing.ingredient.name}
        </div>
      ))}
    </div>
  )
}));

describe('RecipeIngredientsTab', () => {
  const mockIngredients: TableRecipeIngredient[] = [
    {
      ingredient: {
        id: '1',
        name: 'Flour',
        created_by: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      quantity: 2,
      unit: {
        id: '1',
        name: 'cup',
        abbreviation: 'cup',
        conversion_factor: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      unitCost: 0.5,
      totalCost: 1,
      costPercentage: 10
    },
    {
      ingredient: {
        id: '2',
        name: 'Sugar',
        created_by: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      quantity: 1,
      unit: {
        id: '1',
        name: 'cup',
        abbreviation: 'cup',
        conversion_factor: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      unitCost: 0.75,
      totalCost: 0.75,
      costPercentage: 7.5
    }
  ];

  const mockHandlers = {
    onDeleteIngredient: vi.fn(),
    onEditIngredient: vi.fn()
  };

  it('renders ingredients table when ingredients are provided', () => {
    render(
      <RecipeIngredientsTab
        ingredients={mockIngredients}
        onDeleteIngredient={mockHandlers.onDeleteIngredient}
        onEditIngredient={mockHandlers.onEditIngredient}
      />
    );
    
    expect(screen.getByTestId('ingredients-table')).toBeInTheDocument();
    expect(screen.getByTestId('ingredient-0')).toHaveTextContent('Flour');
    expect(screen.getByTestId('ingredient-1')).toHaveTextContent('Sugar');
  });

  it('shows a message when no ingredients are available', () => {
    render(
      <RecipeIngredientsTab
        ingredients={[]}
        onDeleteIngredient={mockHandlers.onDeleteIngredient}
        onEditIngredient={mockHandlers.onEditIngredient}
      />
    );
    
    expect(screen.getByText(/No ingredients added yet/)).toBeInTheDocument();
  });
});