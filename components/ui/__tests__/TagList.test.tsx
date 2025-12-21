// Test stubs for TagList component
import { render, screen } from '@testing-library/react';
import { TagList } from '../TagList';

describe('TagList', () => {
  it('renders all tags when provided', () => {
    render(<TagList tags={['Photography', 'Design', 'Illustration']} />);
    expect(screen.getByText('Photography')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Illustration')).toBeInTheDocument();
  });

  it('displays "No tags" message when tags array is empty', () => {
    render(<TagList tags={[]} />);
    expect(screen.getByText('No tags')).toBeInTheDocument();
  });

  it('limits displayed tags when maxTags is set', () => {
    render(<TagList tags={['Tag1', 'Tag2', 'Tag3', 'Tag4']} maxTags={2} />);
    expect(screen.getByText('Tag1')).toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    const { container } = render(
      <TagList tags={['Test']} variant="solid" />
    );
    expect(container.firstChild?.firstChild).toHaveClass('bg-blue-600', 'text-white');
  });
});

