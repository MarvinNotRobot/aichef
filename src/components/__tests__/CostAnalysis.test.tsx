import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CostAnalysis } from '../../pages/CostAnalysis';
import { useAuthStore } from '../../lib/auth/auth.store';
import { useRecipeStore } from '../../lib/recipe/recipe.store';

// Mock the stores
vi.mock('../../lib/auth/auth.store');
vi.mock('../../lib/recipe/recipe.store');

describe('CostAnalysis', () => {
  beforeEach(() => {
    // Mock auth store
    (useAuthStore as any).mockReturnValue({
      user: { id: '1', email: 'test@example.com' }
    });

    // Mock recipe store
    (useRecipeStore as any).mockReturnValue({
      currentRecipe: {
        id: '1',
        name: 'Test Recipe',
        category: 'Lunch',
        price: '15.00',
        is_taxable: false,
        is_active: true
      },
      isLoading: false,
      error: null,
      fetchRecipeById: vi.fn(),
      updateRecipe: vi.fn(),
      clearCurrentRecipe: vi.fn()
    });
  });

  it('should render recipe details', () => {
    render(<CostAnalysis />);

    expect(screen.getByText('Recipe Details')).toBeInTheDocument();
    expect(screen.getByLabelText('Menu Item Name')).toHaveValue('Test Recipe');
    expect(screen.getByLabelText('Menu Item Category')).toHaveValue('Lunch');
    expect(screen.getByLabelText('Price')).toHaveValue('15.00');
  });

  it('should show unsaved changes indicator', async () => {
    render(<CostAnalysis />);

    const nameInput = screen.getByLabelText('Menu Item Name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Recipe');

    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
  });

  it('should handle save operation', async () => {
    const mockUpdateRecipe = vi.fn().mockResolvedValue({
      id: '1',
      name: 'Updated Recipe',
      category: 'Lunch'
    });

    (useRecipeStore as any).mockReturnValue({
      currentRecipe: {
        id: '1',
        name: 'Test Recipe',
        category: 'Lunch'
      },
      isLoading: false,
      error: null,
      updateRecipe: mockUpdateRecipe
    });

    render(<CostAnalysis />);

    const nameInput = screen.getByLabelText('Menu Item Name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Recipe');

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockUpdateRecipe).toHaveBeenCalledWith('1', expect.objectContaining({
      name: 'Updated Recipe'
    }));
  });

  it('should handle save errors', async () => {
    const mockUpdateRecipe = vi.fn().mockRejectedValue(new Error('Save failed'));

    (useRecipeStore as any).mockReturnValue({
      currentRecipe: {
        id: '1',
        name: 'Test Recipe',
        category: 'Lunch'
      },
      isLoading: false,
      error: null,
      updateRecipe: mockUpdateRecipe
    });

    render(<CostAnalysis />);

    const nameInput = screen.getByLabelText('Menu Item Name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Recipe');

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save recipe')).toBeInTheDocument();
    });
  });
});