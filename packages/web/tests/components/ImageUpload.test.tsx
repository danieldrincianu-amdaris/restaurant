import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import ImageUpload from '../../src/components/menu/ImageUpload';

describe('ImageUpload', () => {
  it('renders upload zone when no image is selected', () => {
    const mockOnChange = vi.fn();
    const mockOnFileSelect = vi.fn();
    
    render(<ImageUpload value={null} onChange={mockOnChange} onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByText('Drop image or click to upload')).toBeInTheDocument();
    expect(screen.getByText(/JPEG, PNG, WebP • Max 5MB/i)).toBeInTheDocument();
  });

  it('displays preview when image URL is provided', () => {
    const mockOnChange = vi.fn();
    const mockOnFileSelect = vi.fn();
    const testUrl = 'http://example.com/image.jpg';
    
    render(<ImageUpload value={testUrl} onChange={mockOnChange} onFileSelect={mockOnFileSelect} />);
    
    const image = screen.getByRole('img', { name: 'Preview' });
    expect(image).toHaveAttribute('src', testUrl);
  });

  it('shows remove button when image is present', () => {
    const mockOnChange = vi.fn();
    const mockOnFileSelect = vi.fn();
    const testUrl = 'http://example.com/image.jpg';
    
    render(<ImageUpload value={testUrl} onChange={mockOnChange} onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('calls onChange with null when remove button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const mockOnFileSelect = vi.fn();
    const testUrl = 'http://example.com/image.jpg';
    
    render(<ImageUpload value={testUrl} onChange={mockOnChange} onFileSelect={mockOnFileSelect} />);
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('shows uploading state when isUploading is true', () => {
    const mockOnChange = vi.fn();
    const mockOnFileSelect = vi.fn();
    const testUrl = 'http://example.com/image.jpg';
    
    render(<ImageUpload value={testUrl} onChange={mockOnChange} onFileSelect={mockOnFileSelect} isUploading={true} />);
    
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('disables remove button while uploading', () => {
    const mockOnChange = vi.fn();
    const mockOnFileSelect = vi.fn();
    const testUrl = 'http://example.com/image.jpg';
    
    render(<ImageUpload value={testUrl} onChange={mockOnChange} onFileSelect={mockOnFileSelect} isUploading={true} />);
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    expect(removeButton).toBeDisabled();
  });
});
