import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UsersClient from '../UsersClient';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

const mockUsers = [
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    company: { name: 'Romaguera-Crona', catchPhrase: 'Multi-layered client-server neural-net', bs: 'harness real-time e-markets' },
    address: { street: 'Kulas Light', suite: 'Apt. 556', city: 'Gwenborough', zipcode: '92998-3874' },
    totalPosts: 5,
    completedTodos: 10,
    pendingTodos: 5,
  },
  {
    id: 2,
    name: 'Ervin Howell',
    username: 'Antonette',
    email: 'Shanna@melissa.tv',
    phone: '010-692-6593 x09125',
    website: 'anastasia.net',
    company: { name: 'Deckow-Crist', catchPhrase: 'Proactive didactic contingency', bs: 'synergize scalable supply-chains' },
    address: { street: 'Victor Plains', suite: 'Suite 879', city: 'Wisokyburgh', zipcode: '90566-7771' },
    totalPosts: 2,
    completedTodos: 0,
    pendingTodos: 10,
  },
];

describe('UsersClient', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (usePathname as jest.Mock).mockReturnValue('/users');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  it('renders users with activity signals', () => {
    render(<UsersClient initialUsers={mockUsers} />);

    // Check if user names are rendered
    expect(screen.getAllByText('Leanne Graham')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ervin Howell')[0]).toBeInTheDocument();

    // Check activity signals (for Leanne)
    expect(screen.getAllByText('P: 5')[0]).toBeInTheDocument();
    expect(screen.getAllByText('✓ 10')[0]).toBeInTheDocument();
    expect(screen.getAllByText('⏱ 5')[0]).toBeInTheDocument();
  });

  it('filters users via search input', async () => {
    render(<UsersClient initialUsers={mockUsers} />);

    const searchInput = screen.getByPlaceholderText('Search name or email...');
    fireEvent.change(searchInput, { target: { value: 'ervin' } });

    await waitFor(() => {
      expect(screen.queryByText('Leanne Graham')).not.toBeInTheDocument();
      expect(screen.getAllByText('Ervin Howell')[0]).toBeInTheDocument();
    });
  });

  it('shows empty state when no users match filter', async () => {
    render(<UsersClient initialUsers={mockUsers} />);

    const searchInput = screen.getByPlaceholderText('Search name or email...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent user' } });

    await waitFor(() => {
      expect(screen.getByText('No users found matching your filters.')).toBeInTheDocument();
    });
  });

  it('applies additional filter (no_completed)', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('filter=no_completed'));

    render(<UsersClient initialUsers={mockUsers} />);

    // Leanne has 10 completed, Ervin has 0. Only Ervin should be shown.
    expect(screen.queryByText('Leanne Graham')).not.toBeInTheDocument();
    expect(screen.getAllByText('Ervin Howell')[0]).toBeInTheDocument();
  });
});
