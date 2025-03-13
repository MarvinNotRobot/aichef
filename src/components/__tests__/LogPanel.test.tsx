import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogPanel } from '../LogPanel';
import { useUIStore } from '../../lib/ui/ui.store';

// Mock the UI store
vi.mock('../../lib/ui/ui.store', () => ({
  useUIStore: vi.fn()
}));

describe('LogPanel', () => {
  beforeEach(() => {
    // Reset console mocks
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    
    // Default mock implementation for useUIStore
    (useUIStore as any).mockReturnValue({
      isLogPanelVisible: true
    });
  });

  it('renders when isLogPanelVisible is true', () => {
    render(<LogPanel />);
    expect(screen.getByText('Application Logs')).toBeInTheDocument();
  });

  it('does not render when isLogPanelVisible is false', () => {
    (useUIStore as any).mockReturnValue({
      isLogPanelVisible: false
    });
    
    render(<LogPanel />);
    expect(screen.queryByText('Application Logs')).not.toBeInTheDocument();
  });

  it('shows filter options', () => {
    render(<LogPanel />);
    expect(screen.getByText('All Levels')).toBeInTheDocument();
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('Warnings')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Debug')).toBeInTheDocument();
  });

  it('shows clear all button', () => {
    render(<LogPanel />);
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });
});