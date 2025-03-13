import React from 'react';
import { RecipeCardImage } from './RecipeCardImage';
import { CostProfitIndicatorBar } from './CostProfitIndicatorBar';
import { PieChart } from './PieChart';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  isDeleting: boolean;
}

export function RecipeCard({ recipe, onDelete, onEdit, isDeleting }: RecipeCardProps) {
  const hasFinancials = recipe.price && recipe.total_cost && recipe.gross_profit;

  const chartData = hasFinancials ? [
    {
      name: 'Food Cost',
      value: ((recipe.food_cost || 0) / recipe.price!) * 100,
      color: '#334155' // slate-700
    },
    {
      name: 'Material',
      value: ((recipe.material_cost || 0) / recipe.price!) * 100,
      color: '#475569' // slate-600
    },
    {
      name: 'Overhead',
      value: ((recipe.overhead_cost || 0) / recipe.price!) * 100,
      color: '#64748b' // slate-500
    },
    {
      name: 'Gross Profit',
      value: ((recipe.gross_profit || 0) / recipe.price!) * 100,
      color: 'url(#profitGradient)' // Using gradient for profit
    }
  ] : [];

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Cost Profit Indicator Bar */}
      {hasFinancials && (
        <CostProfitIndicatorBar
          data={{
            totalCost: recipe.total_cost,
            grossProfitPercentage: (recipe.gross_profit / recipe.price) * 100,
            price: recipe.price
          }}
          height={48}
          className="rounded-none"
        />
      )}
      
      <RecipeCardImage 
        recipeId={recipe.id}
        alt={recipe.name}
        className="h-48"
      />
      
      <div className="p-6">
        {/* Fixed Height Header Section */}
        <div className="h-20 mb-4">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">{recipe.name}</h2>
            <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${
              recipe.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {recipe.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        {/* Fixed Height Chart Section */}
        {hasFinancials && (
          <div className="h-48 mb-6">
            <PieChart
              data={chartData}
              height={180}
              valueFormatter={formatPercentage}
              showLegend={false}
              customDefs={(
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22c55e" /> {/* green-500 */}
                    <stop offset="100%" stopColor="#eab308" /> {/* yellow-500 */}
                  </linearGradient>
                </defs>
              )}
            />
          </div>
        )}

        {/* Fixed Height Details Section */}
        <div className="h-24 mb-4">
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Category:</span> {recipe.category}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Price:</span> ${recipe.price?.toFixed(2) || '0.00'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Last Updated:</span>{' '}
              {new Date(recipe.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onDelete(recipe)}
            disabled={isDeleting}
            className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50"
            data-testid="delete-recipe-button"
          >
            Delete
          </button>
          <button
            onClick={() => onEdit(recipe)}
            className="px-3 py-1 text-sm bg-blue-700 text-white rounded hover:bg-blue-800"
            data-testid="edit-recipe-button"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}