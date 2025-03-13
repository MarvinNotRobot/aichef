import React from 'react';
import type { CostSummary } from '../../types';

interface CostSummaryPanelProps {
  costSummary: CostSummary;
  materialCostPercentage: number;
  overheadCostPercentage: number;
  grossProfitPercentage: number;
  menuItemCategory: string;
  menuItemName: string;
  price: string;
  isTaxable: boolean;
  isActive: boolean;
  recommendedPrice?: number;
  onMaterialPercentageChange: (value: number) => void;
  onOverheadPercentageChange: (value: number) => void;
  onGrossProfitPercentageChange: (value: number) => void;
  onCategoryChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onTaxableChange: (value: boolean) => void;
  onActiveChange: (value: boolean) => void;
}

export function CostSummaryPanel({
  costSummary,
  materialCostPercentage,
  overheadCostPercentage,
  grossProfitPercentage,
  menuItemCategory,
  menuItemName,
  price,
  isTaxable,
  isActive,
  recommendedPrice,
  onMaterialPercentageChange,
  onOverheadPercentageChange,
  onGrossProfitPercentageChange,
  onCategoryChange,
  onNameChange,
  onPriceChange,
  onTaxableChange,
  onActiveChange
}: CostSummaryPanelProps) {
  const handlePercentageChange = (
    value: string,
    onChange: (value: number) => void
  ) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    onChange(isNaN(numValue) ? 0 : numValue);
  };

  const formatPercentage = (value: number) => {
    return isFinite(value) ? value.toFixed(1) : '0.0';
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      onPriceChange(value);
    }
  };

  const useRecommendedPrice = () => {
    if (recommendedPrice && recommendedPrice > 0) {
      onPriceChange(recommendedPrice.toFixed(2));
    }
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Recipe Details Section */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recipe Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
              <span className="ml-1 text-gray-400 hover:text-gray-500 cursor-help" title="Select the category for this menu item">ⓘ</span>
            </label>
            <select
              value={menuItemCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Breakfast</option>
              <option>Dessert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
              <span className="ml-1 text-gray-400 hover:text-gray-500 cursor-help" title="Enter the name of the menu item">ⓘ</span>
            </label>
            <input
              type="text"
              value={menuItemName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Recipe name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price
              <span className="ml-1 text-gray-400 hover:text-gray-500 cursor-help" title="Enter the selling price">ⓘ</span>
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                value={price}
                onChange={handlePriceChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-20"
                placeholder="0.00"
              />
              {recommendedPrice && recommendedPrice > 0 && (
                <button
                  type="button"
                  onClick={useRecommendedPrice}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-indigo-600 hover:text-indigo-800"
                  title={`Use recommended price: $${recommendedPrice.toFixed(2)}`}
                >
                  Use ${recommendedPrice.toFixed(2)}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isTaxable}
                onChange={(e) => onTaxableChange(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Taxable</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => onActiveChange(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Cost Summary Section */}
      <div className="grid grid-cols-5 divide-x">
        {/* Ingredients Cost */}
        <div className="p-6">
          <div className="text-sm font-medium text-gray-600 mb-3">
            Ingredients
          </div>
          <div className="text-xl font-semibold tabular-nums">
            ${costSummary.foodCost.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 tabular-nums mt-2">
            {formatPercentage((costSummary.foodCost / (costSummary.totalCost || 1)) * 100)}%
          </div>
        </div>

        {/* Material Cost */}
        <div className="p-6">
          <div className="text-sm font-medium text-gray-600 mb-3">
            Material
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <input
                type="number"
                value={materialCostPercentage || ''}
                onChange={(e) => handlePercentageChange(e.target.value, onMaterialPercentageChange)}
                className="w-16 text-sm border-gray-300 rounded-md text-right tabular-nums"
                min="0"
                max="100"
                step="0.1"
              />
              <span className="text-sm text-gray-500 ml-1">%</span>
            </div>
            <div className="text-xl font-semibold tabular-nums">
              ${costSummary.materialCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Overhead Cost */}
        <div className="p-6">
          <div className="text-sm font-medium text-gray-600 mb-3">
            Overhead
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <input
                type="number"
                value={overheadCostPercentage || ''}
                onChange={(e) => handlePercentageChange(e.target.value, onOverheadPercentageChange)}
                className="w-16 text-sm border-gray-300 rounded-md text-right tabular-nums"
                min="0"
                max="100"
                step="0.1"
              />
              <span className="text-sm text-gray-500 ml-1">%</span>
            </div>
            <div className="text-xl font-semibold tabular-nums">
              ${costSummary.overheadCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Total Cost */}
        <div className="p-6">
          <div className="text-sm font-medium text-gray-600 mb-3">
            Total Cost
          </div>
          <div className="text-xl font-semibold tabular-nums">
            ${costSummary.totalCost.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 tabular-nums mt-2">
            {formatPercentage((costSummary.totalCost / (costSummary.totalCost || 1)) * 100)}%
          </div>
        </div>

        {/* Gross Profit */}
        <div className="p-6">
          <div className="text-sm font-medium text-gray-600 mb-3">
            Gross Profit
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <input
                type="number"
                value={grossProfitPercentage || ''}
                onChange={(e) => handlePercentageChange(e.target.value, onGrossProfitPercentageChange)}
                className="w-16 text-sm border-gray-300 rounded-md text-right tabular-nums"
                min="0"
                max="100"
                step="0.1"
              />
              <span className="text-sm text-gray-500 ml-1">%</span>
            </div>
            <div className="text-xl font-semibold tabular-nums">
              ${costSummary.grossProfit.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}