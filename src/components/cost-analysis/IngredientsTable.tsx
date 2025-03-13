import React from 'react';
import type { TableRecipeIngredient } from '../../types';

interface IngredientsTableProps {
  ingredients: TableRecipeIngredient[];
  onDeleteIngredient: (index: number) => void;
  onEditIngredient: (index: number, updatedIngredient: TableRecipeIngredient) => void;
}

export function IngredientsTable({
  ingredients,
  onDeleteIngredient,
  onEditIngredient
}: IngredientsTableProps) {
  const handleQuantityChange = (index: number, value: string) => {
    const quantity = parseFloat(value) || 0;
    const ingredient = ingredients[index];
    const updatedIngredient = {
      ...ingredient,
      quantity,
      totalCost: quantity * ingredient.unitCost
    };
    onEditIngredient(index, updatedIngredient);
  };

  const handleUnitCostChange = (index: number, value: string) => {
    const unitCost = parseFloat(value) || 0;
    const ingredient = ingredients[index];
    const updatedIngredient = {
      ...ingredient,
      unitCost,
      totalCost: ingredient.quantity * unitCost
    };
    onEditIngredient(index, updatedIngredient);
  };

  const handleNotesChange = (index: number, value: string) => {
    const ingredient = ingredients[index];
    const updatedIngredient = {
      ...ingredient,
      notes: value
    };
    onEditIngredient(index, updatedIngredient);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ingredient
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Portioned By
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit Cost
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Cost
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cost%
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ingredients.map((ingredient, index) => (
            <tr key={`${ingredient.ingredient.id}-${index}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {ingredient.ingredient.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ingredient.unit.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <input
                  type="number"
                  value={ingredient.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="0"
                  step="0.001"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ingredient.unit.abbreviation}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <input
                  type="number"
                  value={ingredient.unitCost}
                  onChange={(e) => handleUnitCostChange(index, e.target.value)}
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="0"
                  step="0.01"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {ingredient.totalCost.toFixed(3)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {ingredient.costPercentage.toFixed(2)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <input
                  type="text"
                  value={ingredient.notes || ''}
                  onChange={(e) => handleNotesChange(index, e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add notes..."
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  className="text-red-600 hover:text-red-900"
                  onClick={() => onDeleteIngredient(index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}