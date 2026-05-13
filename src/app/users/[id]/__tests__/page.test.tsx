import { render, screen } from '@testing-library/react';
import UserDetailPage from '../page';
import * as api from '@/lib/api';

// Mock the API calls
jest.mock('@/lib/api', () => ({
  getUser: jest.fn(),
  getUserPosts: jest.fn(),
  getUserTodos: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

const mockUser = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
  phone: '1-770-736-8031 x56442',
  website: 'hildegard.org',
  company: { name: 'Romaguera-Crona', catchPhrase: 'Multi-layered client-server neural-net', bs: 'harness real-time e-markets' },
  address: { street: 'Kulas Light', suite: 'Apt. 556', city: 'Gwenborough', zipcode: '92998-3874' },
};

const mockPosts = [
  { id: 1, userId: 1, title: 'Test Post 1', body: 'This is a test post body' }
];

const mockTodos = [
  { id: 1, userId: 1, title: 'Test Todo 1', completed: true },
  { id: 2, userId: 1, title: 'Test Todo 2', completed: false }
];

describe('UserDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user details and sections correctly', async () => {
    (api.getUser as jest.Mock).mockResolvedValue(mockUser);
    (api.getUserPosts as jest.Mock).mockResolvedValue(mockPosts);
    (api.getUserTodos as jest.Mock).mockResolvedValue(mockTodos);

    const resolvedComponent = await UserDetailPage({ params: Promise.resolve({ id: '1' }), searchParams: Promise.resolve({}) });
    render(resolvedComponent);

    // Verify User Info
    expect(screen.getByText('Leanne Graham')).toBeInTheDocument();
    expect(screen.getByText('@Bret')).toBeInTheDocument();
    expect(screen.getByText('Romaguera-Crona')).toBeInTheDocument();
    expect(screen.getByText('"Multi-layered client-server neural-net"')).toBeInTheDocument();

    // Verify Stats (1 Post, 1 Completed Todo, 1 Pending Todo, and possibly badges)
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(3);

    // Verify Sections Content
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
  });

  it('calls notFound when user does not exist', async () => {
    (api.getUser as jest.Mock).mockRejectedValue(new Error('Not found'));
    (api.getUserPosts as jest.Mock).mockResolvedValue([]);
    (api.getUserTodos as jest.Mock).mockResolvedValue([]);
    
    const { notFound } = require('next/navigation');

    try {
      await UserDetailPage({ params: Promise.resolve({ id: '999' }), searchParams: Promise.resolve({}) });
    } catch (e) {
      // ignore
    }

    expect(notFound).toHaveBeenCalled();
  });
});
