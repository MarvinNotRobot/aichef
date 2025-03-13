import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import type { TableRecipeIngredient } from '../../types';

interface IngredientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedIngredient: TableRecipeIngredient) => void;
  ingredient: TableRecipeIngredient | null;
}

export function IngredientEditModal({
  isOpen,
  onClose,
  onSave,
  ingredient
}: IngredientEditModalProps) {
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (ingredient) {
      setQuantity(ingredient.quantity.toString());
      setUnitCost(ingredient.unitCost.toString());
      setNotes(ingredient.notes || '');
    }
  }, [ingredient]);

  const handleSave = () => {
    if (!ingredient) return;

    setIsLoading(true);
    try {
      const updatedIngredient: TableRecipeIngredient = {
        ...ingredient,
        quantity: parseFloat(quantity),
        unitCost: parseFloat(unitCost),
        totalCost: parseFloat(quantity) * parseFloat(unitCost),
        notes: notes.trim()
      };

      onSave(updatedIngredient);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!ingredient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSave}
      title={`Edit ${ingredient.ingredient.name}`}
      message=""
      confirmLabel="Save"
      cancelLabel="Cancel"
      isLoading={isLoading}
    >
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantity ({ingredient.unit.abbreviation})
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            min="0"
            step="0.001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Unit Cost ($)
          </label>
          <input
            type="number"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {quantity && unitCost && (
          <div className="text-sm text-gray-500">
            Total Cost: ${(parseFloat(quantity) * parseFloat(unitCost)).toFixed(3)}
          </div>
        )}
      </div>
    </Modal>
  );
}