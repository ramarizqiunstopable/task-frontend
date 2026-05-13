export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string; bs: string; };
  address: { street: string; suite: string; city: string; zipcode: string; };
};

export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export type CombinedUser = User & {
  totalPosts: number;
  completedTodos: number;
  pendingTodos: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jsonplaceholder.typicode.com';

const fetchOptions = {
  next: { revalidate: 60 } // ISR Bonus
};

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`, fetchOptions);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getUser(id: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, fetchOptions);
  if (!res.ok) {
    if (res.status === 404) return null as any;
    throw new Error('Failed to fetch user');
  }
  return res.json();
}

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${BASE_URL}/posts`, fetchOptions);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/todos`, fetchOptions);
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  const res = await fetch(`${BASE_URL}/posts?userId=${userId}`, fetchOptions);
  if (!res.ok) throw new Error('Failed to fetch user posts');
  return res.json();
}

export async function getUserTodos(userId: string): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/todos?userId=${userId}`, fetchOptions);
  if (!res.ok) throw new Error('Failed to fetch user todos');
  return res.json();
}
