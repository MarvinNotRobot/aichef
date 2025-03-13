import React, { useState } from 'react';

interface EditableInstructionsProps {
  instructions: string[];
  onInstructionsChange: (instructions: string[]) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
}

export function EditableInstructions({
  instructions,
  onInstructionsChange,
  isEditing,
  onToggleEdit
}: EditableInstructionsProps) {
  const [instructionsText, setInstructionsText] = useState<string>(
    instructions.join('\n')
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInstructionsText(e.target.value);
  };

  const handleSave = () => {
    // Split by newlines and filter out empty lines
    const newInstructions = instructionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    onInstructionsChange(newInstructions);
    onToggleEdit();
  };

  const handleCancel = () => {
    // Reset to original instructions
    setInstructionsText(instructions.join('\n'));
    onToggleEdit();
  };

  const handleAddStep = () => {
    const newInstructionsText = instructionsText.trim() + '\n' + `Step ${instructions.length + 1}: `;
    setInstructionsText(newInstructionsText);
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Cooking Instructions</h3>
          <button
            onClick={onToggleEdit}
            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
            data-testid="edit-instructions-button"
          >
            Edit Instructions
          </button>
        </div>
        
        {instructions.length > 0 ? (
          <ol className="list-decimal pl-10 pr-6 py-4 space-y-3">
            {instructions.map((step, index) => (
              <li key={index} className="text-gray-700 pl-2">
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 italic">No cooking instructions available. Click "Edit Instructions" to add some.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Edit Cooking Instructions</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleAddStep}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            data-testid="add-step-button"
          >
            Add Step
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            data-testid="cancel-edit-button"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            data-testid="save-instructions-button"
          >
            Save
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-sm text-gray-500 mb-2">
          Enter each instruction step on a new line. You can use "Step X:" format for clarity.
        </p>
        <textarea
          value={instructionsText}
          onChange={handleTextChange}
          className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter cooking instructions here..."
          data-testid="instructions-textarea"
        />
      </div>
    </div>
  );
}