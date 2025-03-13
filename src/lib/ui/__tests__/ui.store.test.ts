import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUIStore } from '../ui.store';
import { appLogger } from '../../logger';

// Mock the logger
vi.mock('../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('UI Store', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Reset the store to default state
    const { setLogPanelVisible } = useUIStore.getState();
    setLogPanelVisible(true);
  });

  it('should initialize with default values', () => {
    const state = useUIStore.getState();
    expect(state.isLogPanelVisible).toBe(true);
  });

  it('should toggle log panel visibility', () => {
    const { toggleLogPanel } = useUIStore.getState();
    
    // Initial state is true
    expect(useUIStore.getState().isLogPanelVisible).toBe(true);
    
    // Toggle to false
    toggleLogPanel();
    expect(useUIStore.getState().isLogPanelVisible).toBe(false);
    expect(appLogger.info).toHaveBeenCalledWith('Log panel visibility toggled', { visible: false });
    
    // Toggle back to true
    toggleLogPanel();
    expect(useUIStore.getState().isLogPanelVisible).toBe(true);
    expect(appLogger.info).toHaveBeenCalledWith('Log panel visibility toggled', { visible: true });
  });

  it('should set log panel visibility directly', () => {
    const { setLogPanelVisible } = useUIStore.getState();
    
    // Set to false
    setLogPanelVisible(false);
    expect(useUIStore.getState().isLogPanelVisible).toBe(false);
    expect(appLogger.info).toHaveBeenCalledWith('Log panel visibility set', { visible: false });
    
    // Set to true
    setLogPanelVisible(true);
    expect(useUIStore.getState().isLogPanelVisible).toBe(true);
    expect(appLogger.info).toHaveBeenCalledWith('Log panel visibility set', { visible: true });
  });
});