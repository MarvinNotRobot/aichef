import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../../supabase/client';
import { RecipeService } from '../recipe.service';
import type { Recipe } from '../../../types';

// Mock Supabase client
vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}));

describe('Recipe Update Functionality', () => {
  const mockUser = { id: 'test-user-id' };
  const mockRecipe: Recipe = {
    id: 'test-recipe-id',
    name: 'Original Recipe',
    category: 'Lunch',
    version: 1,
    is_active: true,
    is_taxable: false,
    created_by: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  it('should successfully update a recipe', async () => {
    // Mock the fetch of existing recipe
    const mockFrom = supabase.from as any;
    mockFrom().select().eq().eq().single.mockResolvedValueOnce({
      data: mockRecipe,
      error: null
    });

    // Mock the update operation
    const updatedRecipe = { ...mockRecipe, name: 'Updated Recipe' };
    mockFrom().update().eq().eq().select().single.mockResolvedValueOnce({
      data: updatedRecipe,
      error: null
    });

    const result = await RecipeService.updateRecipe(mockRecipe.id, {
      name: 'Updated Recipe'
    });

    expect(result).toEqual(updatedRecipe);
    expect(mockFrom().update).toHaveBeenCalled();
    expect(mockFrom().update().eq).toHaveBeenCalledWith('created_by', mockUser.id);
  });

  it('should fail to update a recipe that does not exist', async () => {
    const mockFrom = supabase.from as any;
    mockFrom().select().eq().eq().single.mockResolvedValueOnce({
      data: null,
      error: null
    });

    await expect(RecipeService.updateRecipe('non-existent-id', {
      name: 'Updated Recipe'
    })).rejects.toThrow('Recipe not found or access denied');
  });

  it('should fail to update a recipe owned by another user', async () => {
    const mockFrom = supabase.from as any;
    mockFrom().select().eq().eq().single.mockResolvedValueOnce({
      data: { ...mockRecipe, created_by: 'different-user-id' },
      error: null
    });

    await expect(RecipeService.updateRecipe(mockRecipe.id, {
      name: 'Updated Recipe'
    })).rejects.toThrow('Recipe not found or access denied');
  });

  it('should handle database errors during update', async () => {
    const mockFrom = supabase.from as any;
    mockFrom().select().eq().eq().single.mockResolvedValueOnce({
      data: mockRecipe,
      error: null
    });

    mockFrom().update().eq().eq().select().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' }
    });

    await expect(RecipeService.updateRecipe(mockRecipe.id, {
      name: 'Updated Recipe'
    })).rejects.toThrow('Database error');
  });
});