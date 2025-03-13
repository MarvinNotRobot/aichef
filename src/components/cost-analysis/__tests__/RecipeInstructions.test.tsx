import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecipeInstructions } from '../RecipeInstructions';

// Mock the EditableInstructions component
vi.mock('../EditableInstructions', () => ({
  EditableInstructions: ({ instructions, isEditing }: any) => (
    <div data-testid="editable-instructions">
      <div>Editable: {isEditing ? 'true' : 'false'}</div>
      <div>Instructions: {instructions.join(', ')}</div>
    </div>
  )
}));

describe('RecipeInstructions', () => {
  const mockInstructions = [
    'Preheat oven to 350°F',
    'Mix ingredients in a bowl',
    'Bake for 30 minutes'
  ];

  it('renders instructions correctly in non-editable mode', () => {
    render(<RecipeInstructions instructions={mockInstructions} />);
    
    expect(screen.getByText('Preheat oven to 350°F')).toBeInTheDocument();
    expect(screen.getByText('Mix ingredients in a bowl')).toBeInTheDocument();
    expect(screen.getByText('Bake for 30 minutes')).toBeInTheDocument();
  });

  it('shows a message when no instructions are available', () => {
    render(<RecipeInstructions instructions={[]} />);
    expect(screen.getByText('No cooking instructions available.')).toBeInTheDocument();
  });

  it('shows a message when instructions are undefined', () => {
    render(<RecipeInstructions />);
    expect(screen.getByText('No cooking instructions available.')).toBeInTheDocument();
  });

  it('renders instructions in an ordered list', () => {
    const instructions = ['Step one', 'Step two'];
    render(<RecipeInstructions instructions={instructions} />);
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
    expect(listItems[0]).toHaveTextContent('Step one');
    expect(listItems[1]).toHaveTextContent('Step two');
  });

  it('renders EditableInstructions when editable is true', () => {
    const onInstructionsChange = vi.fn();
    
    render(
      <RecipeInstructions 
        instructions={mockInstructions} 
        onInstructionsChange={onInstructionsChange}
        editable={true}
      />
    );
    
    expect(screen.getByTestId('editable-instructions')).toBeInTheDocument();
    expect(screen.getByText(`Instructions: ${mockInstructions.join(', ')}`)).toBeInTheDocument();
  });

  it('does not render EditableInstructions when editable is false', () => {
    const onInstructionsChange = vi.fn();
    
    render(
      <RecipeInstructions 
        instructions={mockInstructions} 
        onInstructionsChange={onInstructionsChange}
        editable={false}
      />
    );
    
    expect(screen.queryByTestId('editable-instructions')).not.toBeInTheDocument();
  });

  it('does not render EditableInstructions when onInstructionsChange is not provided', () => {
    render(
      <RecipeInstructions 
        instructions={mockInstructions} 
        editable={true}
      />
    );
    
    expect(screen.queryByTestId('editable-instructions')).not.toBeInTheDocument();
  });
});