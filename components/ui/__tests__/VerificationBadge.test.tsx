// Test stubs for VerificationBadge component
import { render, screen } from '@testing-library/react';
import { VerificationBadge } from '../VerificationBadge';

describe('VerificationBadge', () => {
  it('renders RED tier badge', () => {
    render(<VerificationBadge tier="RED" />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders BLACK tier badge', () => {
    render(<VerificationBadge tier="BLACK" />);
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('renders PLATINUM tier badge with star icon', () => {
    const { container } = render(<VerificationBadge tier="PLATINUM" />);
    expect(screen.getByText('Platinum')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render for NONE tier', () => {
    const { container } = render(<VerificationBadge tier="NONE" />);
    expect(container.firstChild).toBeNull();
  });
});

