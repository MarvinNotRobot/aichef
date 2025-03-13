import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeListService } from '../lib/recipe/recipe-list.service';
import { RecipeCard } from '../components/RecipeCard';
import { Modal } from '../components/Modal';
import { RecipeHeader } from '../components/RecipeHeader';
import { appLogger } from '../lib/logger';
import type { Recipe } from '../types';

type SortField = 'name' | 'price' | 'created_at';
type SortOrder = 'asc' | 'desc';

export function RecipeList() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const loadRecipes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await RecipeListService.fetchRecipes();
      setRecipes(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load recipes';
      setError(message);
      appLogger.error('Failed to load recipes', { error });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField, sortOrder]);

  const sortRecipes = useCallback((recipeList: Recipe[]) => {
    return [...recipeList].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [sortField, sortOrder]);

  const filterRecipes = useCallback(async () => {
    try {
      let filteredRecipes: Recipe[] = [];
      
      if (searchQuery) {
        filteredRecipes = await RecipeListService.searchRecipes(searchQuery);
      } else {
        filteredRecipes = await RecipeListService.filterRecipesByCategory(categoryFilter);
      }

      setRecipes(filteredRecipes);
    } catch (error) {
      appLogger.error('Failed to filter recipes', { error });
      const message = error instanceof Error ? error.message : 'Failed to filter recipes';
      setError(message);
    }
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    filterRecipes();
  }, [filterRecipes]);

  const handleDeleteClick = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;

    try {
      setIsDeleting(true);
      await RecipeListService.deleteRecipe(recipeToDelete.id);
      setRecipeToDelete(null);
      await loadRecipes();
    } catch (error) {
      appLogger.error('Failed to delete recipe', { error, recipeId: recipeToDelete.id });
      alert('Failed to delete recipe. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setRecipeToDelete(null);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    navigate(`/cost-analysis/${recipe.id}`);
  };

  const categories = Array.from(new Set(recipes.map(recipe => recipe.category)));
  const sortedRecipes = sortRecipes(recipes);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RecipeHeader 
        title="Recipe Collection"
        subtitle="Manage Your Recipes"
      />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Sort by</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortField(field as SortField);
              setSortOrder(order as SortOrder);
            }}
            data-testid="sort-select"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            data-testid="category-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="search-input"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRecipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onDelete={handleDeleteClick}
            onEdit={handleEditRecipe}
            isDeleting={isDeleting}
          />
        ))}
      </div>

      {sortedRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500" data-testid="no-recipes-message">No recipes found</p>
        </div>
      )}

      <Modal
        isOpen={!!recipeToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipeToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
}