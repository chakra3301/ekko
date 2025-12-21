// Test stubs for AvailabilityPill component
import { render, screen } from '@testing-library/react';
import { AvailabilityPill } from '../AvailabilityPill';

describe('AvailabilityPill', () => {
  it('renders OPEN status with green styling', () => {
    render(<AvailabilityPill status="OPEN" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Available').parentElement).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders LIMITED status with yellow styling', () => {
    render(<AvailabilityPill status="LIMITED" />);
    expect(screen.getByText('Limited')).toBeInTheDocument();
    expect(screen.getByText('Limited').parentElement).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('renders CLOSED status with red styling', () => {
    render(<AvailabilityPill status="CLOSED" />);
    expect(screen.getByText('Not Available')).toBeInTheDocument();
    expect(screen.getByText('Not Available').parentElement).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('displays status dot indicator', () => {
    const { container } = render(<AvailabilityPill status="OPEN" />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });
});

