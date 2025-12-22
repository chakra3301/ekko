/**
 * Unit tests for Artist Onboarding Page
 * Tests form validation and user interactions
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import ArtistOnboardingPage from '../page';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock portfolio upload
jest.mock('@/components/portfolio/PortfolioUpload', () => ({
  PortfolioUpload: ({ onUpload }: { onUpload: (items: Array<{ mediaUrl: string; type: string }>) => void }): React.ReactElement => (
    <div data-testid="portfolio-upload">
      <button
        onClick={() =>
          onUpload([
            { mediaUrl: '/mock/1.jpg', type: 'IMAGE' },
            { mediaUrl: '/mock/2.jpg', type: 'IMAGE' },
            { mediaUrl: '/mock/3.jpg', type: 'IMAGE' },
          ])
        }
      >
        Upload 3 items
      </button>
    </div>
  ),
}));

describe('ArtistOnboardingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-123',
          email: 'artist@example.com',
          role: 'ARTIST',
          profileCompleted: false,
        },
      },
      status: 'authenticated',
    });
  });

  it('renders the onboarding form', () => {
    render(<ArtistOnboardingPage />);
    expect(screen.getByText('Display Name')).toBeInTheDocument();
  });

  it('validates display name is required', async () => {
    render(<ArtistOnboardingPage />);

    // Next button should be disabled when display name is empty
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('validates at least one discipline is required', async () => {
    render(<ArtistOnboardingPage />);

    // Enter display name and proceed
    const displayNameInput = screen.getByLabelText(/display name/i);
    fireEvent.change(displayNameInput, { target: { value: 'Test Artist' } });
    fireEvent.click(screen.getByText('Next'));

    // Next button should be disabled when no disciplines are added
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });
  });

  it('validates at least 3 portfolio items are required', async () => {
    render(<ArtistOnboardingPage />);

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test Artist' },
    });
    fireEvent.click(screen.getByText('Next'));

    // Add discipline
    const disciplineInput = screen.getByPlaceholderText(/e\.g\., photography, illustration/i);
    fireEvent.change(disciplineInput, { target: { value: 'Photography' } });
    fireEvent.keyDown(disciplineInput, { key: 'Enter' });
    fireEvent.click(screen.getByText('Next'));

    // Skip bio (optional)
    fireEvent.click(screen.getByText('Next'));

    // Skip tools (optional)
    fireEvent.click(screen.getByText('Next'));

    // Submit button should be disabled when less than 3 portfolio items
    const submitButton = screen.getByText(/complete onboarding/i);
    expect(submitButton).toBeDisabled();
  });

  it('allows adding and removing disciplines', async () => {
    render(<ArtistOnboardingPage />);

    // Enter display name
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test Artist' },
    });
    fireEvent.click(screen.getByText('Next'));

    // Add discipline
    const disciplineInput = screen.getByPlaceholderText(/e\.g\., photography, illustration/i);
    fireEvent.change(disciplineInput, { target: { value: 'Photography' } });
    fireEvent.keyDown(disciplineInput, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Photography')).toBeInTheDocument();
    });

    // Remove discipline - the component renders "Remove" buttons for each discipline
    const removeButtons = screen.getAllByText('Remove');
    // Click the first remove button (which removes the first discipline, Photography)
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);
      await waitFor(() => {
        expect(screen.queryByText('Photography')).not.toBeInTheDocument();
      });
    }
  });

  it('navigates through all steps', async () => {
    render(<ArtistOnboardingPage />);

    // Step 1: Display Name
    expect(screen.getByText("What's your display name?")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test Artist' },
    });
    fireEvent.click(screen.getByText('Next'));

    // Step 2: Disciplines
    await waitFor(() => {
      expect(screen.getByText('What are your disciplines?')).toBeInTheDocument();
    });

    const disciplineInput = screen.getByPlaceholderText(/e\.g\., photography, illustration/i);
    fireEvent.change(disciplineInput, { target: { value: 'Photography' } });
    fireEvent.keyDown(disciplineInput, { key: 'Enter' });
    fireEvent.click(screen.getByText('Next'));

    // Step 3: Bio
    await waitFor(() => {
      expect(screen.getByText(/bio/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Next'));

    // Step 4: Tools
    await waitFor(() => {
      expect(screen.getByText(/tools/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Next'));

    // Step 5: Portfolio
    await waitFor(() => {
      expect(screen.getByText(/portfolio/i)).toBeInTheDocument();
    });
  });

  it('allows going back to previous steps', async () => {
    render(<ArtistOnboardingPage />);

    // Fill step 1 and proceed
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Test Artist' },
    });
    fireEvent.click(screen.getByText('Next'));

    // Add discipline and proceed
    await waitFor(() => {
      const disciplineInput = screen.getByPlaceholderText(/e\.g\., photography, illustration/i);
      fireEvent.change(disciplineInput, { target: { value: 'Photography' } });
      fireEvent.keyDown(disciplineInput, { key: 'Enter' });
    });

    fireEvent.click(screen.getByText('Next'));

    // Go back
    await waitFor(() => {
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
    });

    // Should be back on step 2 (disciplines)
    await waitFor(() => {
      expect(screen.getByText('What are your disciplines?')).toBeInTheDocument();
    });
  });
});
