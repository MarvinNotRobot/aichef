import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Settings } from '../Settings';
import { useUIStore } from '../../lib/ui/ui.store';

// Mock the UI store
vi.mock('../../lib/ui/ui.store', () => ({
  useUIStore: vi.fn()
}));

describe('Settings', () => {
  it('renders the settings page with log panel toggle', () => {
    const mockSetLogPanelVisible = vi.fn();
    
    (useUIStore as any).mockReturnValue({
      isLogPanelVisible: true,
      setLogPanelVisible: mockSetLogPanelVisible
    });
    
    render(<Settings />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Display Settings')).toBeInTheDocument();
    expect(screen.getByText('Application Logs')).toBeInTheDocument();
    expect(screen.getByText('Visible')).toBeInTheDocument();
    
    const toggle = screen.getByTestId('log-panel-toggle');
    expect(toggle).toBeChecked();
  });

  it('toggles log panel visibility when checkbox is clicked', () => {
    const mockSetLogPanelVisible = vi.fn();
    
    (useUIStore as any).mockReturnValue({
      isLogPanelVisible: true,
      setLogPanelVisible: mockSetLogPanelVisible
    });
    
    render(<Settings />);
    
    const toggle = screen.getByTestId('log-panel-toggle');
    fireEvent.click(toggle);
    
    expect(mockSetLogPanelVisible).toHaveBeenCalledWith(false);
  });

  it('shows correct label when log panel is hidden', () => {
    (useUIStore as any).mockReturnValue({
      isLogPanelVisible: false,
      setLogPanelVisible: vi.fn()
    });
    
    render(<Settings />);
    
    expect(screen.getByText('Hidden')).toBeInTheDocument();
    const toggle = screen.getByTestId('log-panel-toggle');
    expect(toggle).not.toBeChecked();
  });
});