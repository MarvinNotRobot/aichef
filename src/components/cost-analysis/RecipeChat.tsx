import React from 'react';

interface RecipeChatProps {
  isOpen: boolean;
  onToggle: () => void;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
  error: string | null;
}

export function RecipeChat({
  isOpen,
  onToggle,
  chatInput,
  onChatInputChange,
  onSubmit,
  isProcessing,
  error
}: RecipeChatProps) {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Enter either:</p>
        <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
          <li>A recipe name (e.g., "Thai Tofu Yellow Curry")</li>
          <li>Ingredient details (e.g., "Tofu $2.99/lb, Yellow curry paste $4.99/jar")</li>
        </ul>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 mb-4">
          <textarea
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            placeholder="Enter recipe name or ingredients..."
            className="w-full h-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            disabled={isProcessing}
          />
        </div>
        
        <button
          type="submit"
          disabled={isProcessing || !chatInput.trim()}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : 'Process Recipe'}
        </button>
      </form>
    </div>
  );
}