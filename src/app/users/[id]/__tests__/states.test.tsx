import { render, screen } from '@testing-library/react';
import UserDetailLoading from '../loading';
import ErrorBoundary from '../error';

describe('User Detail States', () => {
  describe('Loading State', () => {
    it('renders the loading skeleton correctly', () => {
      const { container } = render(<UserDetailLoading />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders the error boundary correctly', () => {
      const mockReset = jest.fn();
      render(<ErrorBoundary error={new Error('Test error')} reset={mockReset} />);

      expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
      expect(screen.getByText(/We encountered an error/i)).toBeInTheDocument();
    });
  });
});
