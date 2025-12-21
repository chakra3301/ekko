// Test stubs for PortfolioUpload component
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PortfolioUpload } from '../PortfolioUpload';

// Mock the upload function
jest.mock('@/lib/portfolio-upload', () => ({
  uploadPortfolioFile: jest.fn(),
  validatePortfolioFile: jest.fn(() => ({ valid: true })),
}));

describe('PortfolioUpload', () => {
  it('renders file input', () => {
    render(<PortfolioUpload onUpload={jest.fn()} />);
    const input = screen.getByLabelText(/portfolio items/i);
    expect(input).toBeInTheDocument();
  });

  it('shows error when required and no files uploaded', () => {
    render(<PortfolioUpload onUpload={jest.fn()} required />);
    const uploadButton = screen.getByText(/upload/i);
    fireEvent.click(uploadButton);
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });

  it('displays file previews after selection', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<PortfolioUpload onUpload={jest.fn()} />);
    const input = screen.getByLabelText(/portfolio items/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  it('enforces maxFiles limit', () => {
    render(<PortfolioUpload onUpload={jest.fn()} maxFiles={2} />);
    const input = screen.getByLabelText(/portfolio items/i);
    const files = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      new File(['test3'], 'test3.jpg', { type: 'image/jpeg' }),
    ];
    
    fireEvent.change(input, { target: { files } });
    expect(screen.getByText(/maximum 2 files/i)).toBeInTheDocument();
  });
});

