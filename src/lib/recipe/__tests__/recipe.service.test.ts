import { describe, it, expect, vi } from 'vitest';
import { RecipeService } from '../recipe.service';
import { supabase } from '../../supabase/client';

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

describe('RecipeService', () => {
  describe('updateRecipe', () => {
    it('should successfully update a recipe', async () => {
      // Mock authenticated user
      const mockUser = { id: 'test-user-id' };
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });

      // Mock existing recipe
      const mockExistingRecipe = {
        id: 'test-recipe-id',
        name: 'Old Recipe Name',
        category: 'Lunch',
        created_by: 'test-user-id'
      };

      // Mock recipe update data
      const mockUpdateData = {
        name: 'Updated Recipe Name',
        category: 'Dinner',
        is_active: true,
        price: 15.99
      };

      // Mock Supabase responses
      const mockFrom = supabase.from as any;
      mockFrom().select().eq().eq().single.mockResolvedValueOnce({
        data: mockExistingRecipe,
        error: null
      });

      mockFrom().update().eq().eq().select().single.mockResolvedValueOnce({
        data: { ...mockExistingRecipe, ...mockUpdateData },
        error: null
      });

      // Test the update
      const result = await RecipeService.updateRecipe('test-recipe-id', mockUpdateData);

      // Verify the result
      expect(result).toEqual(expect.objectContaining({
        id: 'test-recipe-id',
        name: 'Updated Recipe Name',
        category: 'Dinner'
      }));

      // Verify that created_by was used in the WHERE clause
      expect(mockFrom().update().eq).toHaveBeenCalledWith('created_by', 'test-user-id');
    });

    it('should fail to update a recipe for unauthorized user', async () => {
      // Mock authenticated user
      const mockUser = { id: 'different-user-id' };
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });

      // Mock existing recipe with different owner
      const mockExistingRecipe = {
        id: 'test-recipe-id',
        name: 'Old Recipe Name',
        category: 'Lunch',
        created_by: 'original-user-id'
      };

      // Mock Supabase responses
      const mockFrom = supabase.from as any;
      mockFrom().select().eq().eq().single.mockResolvedValueOnce({
        data: mockExistingRecipe,
        error: null
      });

      // Test the update
      await expect(RecipeService.updateRecipe('test-recipe-id', {
        name: 'Updated Recipe Name'
      })).rejects.toThrow('Recipe not found or access denied');
    });
  });
});