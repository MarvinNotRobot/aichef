import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoUploader } from '../PhotoUploader';

// Mock logger
vi.mock('../../../lib/logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('PhotoUploader', () => {
  const mockOnFileSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<PhotoUploader onFileSelected={mockOnFileSelected} />);
    
    const fileInput = screen.getByTestId('file-input');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
    expect(fileInput).not.toBeDisabled();
    
    const label = screen.getByText('Upload Photo');
    expect(label).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(
      <PhotoUploader 
        onFileSelected={mockOnFileSelected}
        disabled={true}
        label="Custom Label"
        accept=".jpg,.png"
        className="custom-class"
      />
    );
    
    const fileInput = screen.getByTestId('file-input');
    expect(fileInput).toHaveAttribute('accept', '.jpg,.png');
    expect(fileInput).toBeDisabled();
    
    const label = screen.getByText('Custom Label');
    expect(label).toBeInTheDocument();
  });

  it('handles file selection correctly', async () => {
    mockOnFileSelected.mockResolvedValue(undefined);
    
    render(<PhotoUploader onFileSelected={mockOnFileSelected} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('file-input');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(mockOnFileSelected).toHaveBeenCalledWith(file);
    });
  });

  it('shows error for non-image files', async () => {
    render(<PhotoUploader onFileSelected={mockOnFileSelected} />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('file-input');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('Please select an image file')).toBeInTheDocument();
      expect(mockOnFileSelected).not.toHaveBeenCalled();
    });
  });

  it('shows error for files larger than 5MB', async () => {
    render(<PhotoUploader onFileSelected={mockOnFileSelected} />);
    
    // Create a mock file with size > 5MB
    const file = new File(['test'], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });
    
    const fileInput = screen.getByTestId('file-input');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('File size must be less than 5MB')).toBeInTheDocument();
      expect(mockOnFileSelected).not.toHaveBeenCalled();
    });
  });

  it('shows error when upload fails', async () => {
    mockOnFileSelected.mockRejectedValue(new Error('Upload failed'));
    
    render(<PhotoUploader onFileSelected={mockOnFileSelected} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('file-input');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  it('shows uploading state during file upload', async () => {
    // Create a promise that we can resolve manually
    let resolveUpload: () => void;
    const uploadPromise = new Promise<void>(resolve => {
      resolveUpload = resolve;
    });
    
    mockOnFileSelected.mockImplementation(() => uploadPromise);
    
    render(<PhotoUploader onFileSelected={mockOnFileSelected} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('file-input');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // Check that uploading state is shown
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    
    // Resolve the upload
    resolveUpload();
    
    await waitFor(() => {
      expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();
      expect(screen.getByText('Upload Photo')).toBeInTheDocument();
    });
  });
});