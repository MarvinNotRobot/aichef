import React, { useState } from 'react';
import { EditableInstructions } from './EditableInstructions';

interface RecipeInstructionsProps {
  instructions?: string[];
  onInstructionsChange?: (instructions: string[]) => void;
  editable?: boolean;
}

export function RecipeInstructions({ 
  instructions = [], 
  onInstructionsChange,
  editable = false
}: RecipeInstructionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleEdit = () => {
    if (editable && onInstructionsChange) {
      setIsEditing(!isEditing);
    }
  };

  const handleInstructionsChange = (newInstructions: string[]) => {
    if (onInstructionsChange) {
      onInstructionsChange(newInstructions);
    }
  };

  if (editable && onInstructionsChange) {
    return (
      <EditableInstructions
        instructions={instructions}
        onInstructionsChange={handleInstructionsChange}
        isEditing={isEditing}
        onToggleEdit={handleToggleEdit}
      />
    );
  }

  if (!instructions || instructions.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 italic">No cooking instructions available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Cooking Instructions</h3>
      </div>
      <ol className="list-decimal pl-10 pr-6 py-4 space-y-3">
        {instructions.map((step, index) => (
          <li key={index} className="text-gray-700 pl-2">
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}