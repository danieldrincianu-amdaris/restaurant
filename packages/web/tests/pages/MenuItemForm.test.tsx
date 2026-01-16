import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Category } from '@restaurant/shared';
import MenuItemForm from '../../src/pages/admin/MenuItemForm';
import { ToastProvider } from '../../src/contexts/ToastContext';

// Mock router navigation
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  };
});

// Mock all hook modules
vi.mock('../../src/hooks/useMenuItem', () => ({
  useMenuItem: () => ({
    item: null,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../../src/hooks/useCreateMenuItem', () => ({
  useCreateMenuItem: () => ({
    createMenuItem: vi.fn().mockResolvedValue({}),
    isSubmitting: false,
    error: null,
  }),
}));

vi.mock('../../src/hooks/useUpdateMenuItem', () => ({
  useUpdateMenuItem: () => ({
    updateMenuItem: vi.fn().mockResolvedValue({}),
    isSubmitting: false,
    error: null,
  }),
}));

vi.mock('../../src/hooks/useImageUpload', () => ({
  useImageUpload: () => ({
    uploadImage: vi.fn().mockResolvedValue('/uploads/test.jpg'),
    isUploading: false,
    error: null,
    uploadedUrl: null,
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </MemoryRouter>
  );
};

describe('MenuItemForm', () => {
  it('renders create form with correct title', () => {
    renderWithProviders(<MenuItemForm />);
    expect(screen.getByText('Add New Menu Item')).toBeInTheDocument();
  });

  it('displays validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MenuItemForm />);

    const submitButton = screen.getByRole('button', { name: /save menu item/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/price is required/i)).toBeInTheDocument();
    });
  });

  it('allows filling out form fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MenuItemForm />);

    await user.type(screen.getByLabelText(/name/i), 'New Item');
    await user.type(screen.getByLabelText(/price/i), '12.50');
    await user.selectOptions(screen.getByLabelText(/category/i), Category.APPETIZER);

    await waitFor(() => {
      expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe('New Item');
      expect((screen.getByLabelText(/price/i) as HTMLInputElement).value).toBe('12.5');
      expect((screen.getByLabelText(/category/i) as HTMLSelectElement).value).toBe(Category.APPETIZER);
    });
  });

  it('renders cancel and submit buttons', () => {
    renderWithProviders(<MenuItemForm />);
    
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save menu item/i })).toBeInTheDocument();
  });
});
