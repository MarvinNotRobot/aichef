import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeList } from '../RecipeList';
import { useRecipeStore } from '../../lib/recipe/recipe.store';
import { RecipeService } from '../../lib/recipe/recipe.service';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('../../lib/recipe/recipe.store');
vi.mock('../../lib/recipe/recipe.service');

describe('RecipeList', () => {
  const mockNavigate = vi.fn();
  const mockFetchRecipes = vi.fn();
  const mockRecipes = [
    {
      id: '1',
      name: 'Recipe 1',
      category: 'Lunch',
      price: 10.99,
      is_active: true,
      created_at: '2025-02-18T00:00:00Z',
      updated_at: '2025-02-18T00:00:00Z'
    },
    {
      id: '2',
      name: 'Recipe 2',
      category: 'Dinner',
      price: 15.99,
      is_active: false,
      created_at: '2025-02-17T00:00:00Z',
      updated_at: '2025-02-17T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useRecipeStore as any).mockReturnValue({
      recipes: mockRecipes,
      fetchRecipes: mockFetchRecipes,
      isLoading: false,
      error: null
    });
  });

  it('renders recipe list correctly', () => {
    render(<RecipeList />);
    
    expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Recipe 2')).toBeInTheDocument();
    expect(mockFetchRecipes).toHaveBeenCalled();
  });

  it('handles sorting correctly', async () => {
    render(<RecipeList />);
    
    const sortSelect = screen.getByTestId('sort-select');
    await userEvent.selectOptions(sortSelect, 'price-desc');
    
    const recipes = screen.getAllByTestId('recipe-card');
    expect(recipes[0]).toHaveTextContent('Recipe 2'); // Higher price
    expect(recipes[1]).toHaveTextContent('Recipe 1'); // Lower price
  });

  it('handles category filtering correctly', async () => {
    render(<RecipeList />);
    
    const categorySelect = screen.getByTestId('category-select');
    await userEvent.selectOptions(categorySelect, 'Lunch');
    
    expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    expect(screen.queryByText('Recipe 2')).not.toBeInTheDocument();
  });

  it('handles search filtering correctly', async () => {
    render(<RecipeList />);
    
    const searchInput = screen.getByTestId('search-input');
    await userEvent.type(searchInput, 'Recipe 1');
    
    expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    expect(screen.queryByText('Recipe 2')).not.toBeInTheDocument();
  });

  it('handles recipe deletion', async () => {
    const mockDeleteRecipe = vi.fn();
    (RecipeService.deleteRecipe as any).mockImplementation(mockDeleteRecipe);
    
    render(<RecipeList />);
    
    const deleteButton = screen.getAllByTestId('delete-recipe-button')[0];
    window.confirm = vi.fn(() => true);
    
    await userEvent.click(deleteButton);
    
    expect(mockDeleteRecipe).toHaveBeenCalledWith('1');
    expect(mockFetchRecipes).toHaveBeenCalled();
  });

  it('handles recipe editing', async () => {
    render(<RecipeList />);
    
    const editButton = screen.getAllByTestId('edit-recipe-button')[0];
    await userEvent.click(editButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/cost-analysis/1');
  });

  it('shows loading state', () => {
    (useRecipeStore as any).mockReturnValue({
      recipes: [],
      fetchRecipes: mockFetchRecipes,
      isLoading: true,
      error: null
    });

    render(<RecipeList />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const errorMessage = 'Failed to load recipes';
    (useRecipeStore as any).mockReturnValue({
      recipes: [],
      fetchRecipes: mockFetchRecipes,
      isLoading: false,
      error: errorMessage
    });

    render(<RecipeList />);
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it('shows no recipes message when filtered list is empty', async () => {
    render(<RecipeList />);
    
    const searchInput = screen.getByTestId('search-input');
    await userEvent.type(searchInput, 'nonexistent recipe');
    
    expect(screen.getByTestId('no-recipes-message')).toBeInTheDocument();
  });
});