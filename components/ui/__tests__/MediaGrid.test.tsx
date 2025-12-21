// Test stubs for MediaGrid component
import { render, screen } from '@testing-library/react';
import { MediaGrid } from '../MediaGrid';
import { mockArtistProfile } from '@/lib/fixtures/artist';

describe('MediaGrid', () => {
  const mockItems = mockArtistProfile.portfolioItems.map((item) => ({
    id: item.id,
    type: item.type,
    mediaUrl: item.mediaUrl,
    thumbnailUrl: item.thumbnailUrl,
    title: item.title,
    description: item.description,
  }));

  it('renders with fixture props', () => {
    render(<MediaGrid items={mockItems} />);
    expect(screen.getByText('Portrait Session')).toBeInTheDocument();
  });

  it('displays "No portfolio items" when items array is empty', () => {
    render(<MediaGrid items={[]} />);
    expect(screen.getByText('No portfolio items yet')).toBeInTheDocument();
  });

  it('renders correct number of items', () => {
    const { container } = render(<MediaGrid items={mockItems} />);
    const gridItems = container.querySelectorAll('.group');
    expect(gridItems.length).toBe(mockItems.length);
  });

  it('calls onItemClick when item is clicked', () => {
    const handleClick = jest.fn();
    render(<MediaGrid items={mockItems} onItemClick={handleClick} />);
    const firstItem = screen.getByText('Portrait Session').closest('.group');
    if (firstItem) {
      firstItem.click();
      expect(handleClick).toHaveBeenCalledWith(mockItems[0]);
    }
  });
});

