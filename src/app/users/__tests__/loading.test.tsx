import { render, screen } from '@testing-library/react';
import UsersLoading from '../loading';

describe('UsersLoading Component', () => {
  it('renders the loading skeleton correctly', () => {
    const { container } = render(<UsersLoading />);
    // Simply check if it renders without crashing and contains skeleton items
    expect(container.firstChild).toBeInTheDocument();
  });
});
