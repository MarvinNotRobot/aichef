import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeCard } from '../RecipeCard';
import type { Recipe } from '../../../types';

describe('RecipeCard', () => {
  const mockRecipe: Recipe = {
    id: '1',
    name: 'Test Recipe',
    category: 'Dinner',
    version: 1,
    is_active: true,
    is_taxable: false,
    price: 27.50,
    total_cost: 21.03,
    gross_profit: 8.93,
    created_by: 'user-1',
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z'
  };

  const mockHandlers = {
    onDelete: vi.fn(),
    onEdit: vi.fn()
  };

  it('renders recipe details correctly', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        isDeleting={false}
      />
    );

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText(/\$27\.50/)).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders cost profit indicator when cost and profit data exists', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        isDeleting={false}
      />
    );

    expect(screen.getByTestId('cost-profit-indicator')).toBeInTheDocument();
  });

  it('does not render cost profit indicator when data is missing', () => {
    const recipeWithoutCosts = {
      ...mockRecipe,
      total_cost: undefined,
      gross_profit: undefined
    };

    render(
      <RecipeCard
        recipe={recipeWithoutCosts}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        isDeleting={false}
      />
    );

    expect(screen.queryByTestId('cost-profit-indicator')).not.toBeInTheDocument();
  });

  it('handles delete button click', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        isDeleting={false}
      />
    );

    fireEvent.click(screen.getByTestId('delete-recipe-button'));
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockRecipe);
  });

  it('handles edit button click', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        isDeleting={false}
      />
    );

    fireEvent.click(screen.getByTestId('edit-recipe-button'));
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockRecipe);
  });

  it('disables delete button when isDeleting is true', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        isDeleting={true}
      />
    );

    expect(screen.getByTestId('delete-recipe-button')).toBeDisabled();
  });
});