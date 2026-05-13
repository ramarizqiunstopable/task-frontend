import { render, screen, waitFor } from '@testing-library/react';
import UsersPage from '../page';
import { getUsers, getPosts, getTodos } from '@/lib/api';

// Mock the API calls
jest.mock('@/lib/api', () => ({
  getUsers: jest.fn(),
  getPosts: jest.fn(),
  getTodos: jest.fn(),
}));

// Mock the Client component so we don't need to deal with useRouter etc here
jest.mock('../UsersClient', () => {
  return function MockUsersClient({ initialUsers }: { initialUsers: any }) {
    return <div data-testid="users-client">UsersClient with {initialUsers.length} users</div>;
  };
});

const mockUsers = [{ id: 1, name: 'John Doe' }];
const mockPosts = [{ userId: 1, id: 1, title: 'Post 1' }];
const mockTodos = [
  { userId: 1, id: 1, completed: true },
  { userId: 1, id: 2, completed: false },
];

describe('UsersPage Server Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders successfully with combined data', async () => {
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (getPosts as jest.Mock).mockResolvedValue(mockPosts);
    (getTodos as jest.Mock).mockResolvedValue(mockTodos);

    const ui = await UsersPage();
    render(ui);

    // Should render UsersClient
    expect(screen.getByTestId('users-client')).toBeInTheDocument();
    
    // Check if the data is combined properly (mock checks the length)
    expect(screen.getByText('UsersClient with 1 users')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    (getUsers as jest.Mock).mockRejectedValue(new Error('API Error'));
    (getPosts as jest.Mock).mockResolvedValue(mockPosts);
    (getTodos as jest.Mock).mockResolvedValue(mockTodos);

    const ui = await UsersPage();
    render(ui);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load users data.')).toBeInTheDocument();
  });
});
