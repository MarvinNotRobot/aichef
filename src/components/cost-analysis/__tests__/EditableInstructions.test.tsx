import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableInstructions } from '../EditableInstructions';

describe('EditableInstructions', () => {
  const mockInstructions = [
    'Preheat oven to 350°F',
    'Mix ingredients in a bowl',
    'Bake for 30 minutes'
  ];

  const mockHandlers = {
    onInstructionsChange: vi.fn(),
    onToggleEdit: vi.fn()
  };

  it('renders instructions in view mode correctly', () => {
    render(
      <EditableInstructions
        instructions={mockInstructions}
        onInstructionsChange={mockHandlers.onInstructionsChange}
        isEditing={false}
        onToggleEdit={mockHandlers.onToggleEdit}
      />
    );
    
    expect(screen.getByText('Preheat oven to 350°F')).toBeInTheDocument();
    expect(screen.getByText('Mix ingredients in a bowl')).toBeInTheDocument();
    expect(screen.getByText('Bake for 30 minutes')).toBeInTheDocument();
    expect(screen.getByTestId('edit-instructions-button')).toBeInTheDocument();
  });

  it('renders edit mode correctly', () => {
    render(
      <EditableInstructions
        instructions={mockInstructions}
        onInstructionsChange={mockHandlers.onInstructionsChange}
        isEditing={true}
        onToggleEdit={mockHandlers.onToggleEdit}
      />
    );
    
    expect(screen.getByTestId('instructions-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('save-instructions-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('add-step-button')).toBeInTheDocument();
    
    // Check that the textarea contains the instructions
    const textarea = screen.getByTestId('instructions-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe(mockInstructions.join('\n'));
  });

  it('calls onToggleEdit when edit button is clicked', async () => {
    render(
      <EditableInstructions
        instructions={mockInstructions}
        onInstructionsChange={mockHandlers.onInstructionsChange}
        isEditing={false}
        onToggleEdit={mockHandlers.onToggleEdit}
      />
    );
    
    await userEvent.click(screen.getByTestId('edit-instructions-button'));
    expect(mockHandlers.onToggleEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onInstructionsChange with updated instructions when save is clicked', async () => {
    render(
      <EditableInstructions
        instructions={mockInstructions}
        onInstructionsChange={mockHandlers.onInstructionsChange}
        isEditing={true}
        onToggleEdit={mockHandlers.onToggleEdit}
      />
    );
    
    // Modify the instructions
    const textarea = screen.getByTestId('instructions-textarea');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'New instruction 1\nNew instruction 2');
    
    // Save the changes
    await userEvent.click(screen.getByTestId('save-instructions-button'));
    
    expect(mockHandlers.onInstructionsChange).toHaveBeenCalledWith([
      'New instruction 1',
      'New instruction 2'
    ]);
    expect(mockHandlers.onToggleEdit).toHaveBeenCalledTimes(1);
  });

  it('resets to original instructions when cancel is clicked', async () => {
    render(
      <EditableInstructions
        instructions={mockInstructions}
        onInstructionsChange={mockHandlers.onInstructionsChange}
        isEditing={true}
        onToggleEdit={mockHandlers.onToggleEdit}
      />
    );
    
    // Modify the instructions
    const textarea = screen.getByTestId('instructions-textarea');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'New instruction');
    
    // Cancel the changes
    await userEvent.click(screen.getByTestId('cancel-edit-button'));
    
    expect(mockHandlers.onInstructionsChange).not.toHaveBeenCalled();
    expect(mockHandlers.onToggleEdit).toHaveBeenCalledTimes(1);
  });

  it('adds a new step when add step button is clicked', async () => {
    render(
      <EditableInstructions
        instructions={mockInstructions}
        onInstructionsChange={mockHandlers.onInstructionsChange}
        isEditing={true}
        onToggleEdit={mockHandlers.onToggleEdit}
      />
    );
    
    await userEvent.click(screen.getByTestId('add-step-button'));
    
    const textarea = screen.getByTestId('instructions-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain('Step 4:');
  });

  it('shows a message when no instructions are available in view mode', () => {
    render(
      <EditableInstructions
        instructions={[]}
        onInstructionsChange={mockHandlers.onInstructionsChange}
        isEditing={false}
        onToggleEdit={mockHandlers.onToggleEdit}
      />
    );
    
    expect(screen.getByText(/No cooking instructions available/)).toBeInTheDocument();
  });

  it('filters out empty lines when saving', async () => {
    render(
      <EditableInstructions
        instructions={mockInstructions}
        onInstructionsChange={mockHandlers.onInstructionsChange}
        isEditing={true}
        onToggleEdit={mockHandlers.onToggleEdit}
      />
    );
    
    // Add text with empty lines
    const textarea = screen.getByTestId('instructions-textarea');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Step 1\n\nStep 2\n  \nStep 3');
    
    // Save the changes
    await userEvent.click(screen.getByTestId('save-instructions-button'));
    
    expect(mockHandlers.onInstructionsChange).toHaveBeenCalledWith([
      'Step 1',
      'Step 2',
      'Step 3'
    ]);
  });
});