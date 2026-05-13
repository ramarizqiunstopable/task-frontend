import { getUsers, getPosts, getTodos } from '@/lib/api';
import UsersClient from './UsersClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users List | User Operations',
  description: 'View and manage user operations, including their posts and todos activity.',
};

export default async function UsersPage() {
  try {
    const [users, posts, todos] = await Promise.all([
      getUsers(),
      getPosts(),
      getTodos(),
    ]);

    // Combine data
    const combinedUsers = users.map((user) => {
      const userPosts = posts.filter((post) => post.userId === user.id);
      const userTodos = todos.filter((todo) => todo.userId === user.id);
      const completedTodos = userTodos.filter((todo) => todo.completed).length;
      const pendingTodos = userTodos.length - completedTodos;

      return {
        ...user,
        totalPosts: userPosts.length,
        completedTodos,
        pendingTodos,
      };
    });

    return <UsersClient initialUsers={combinedUsers} />;
  } catch (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error</h2>
          <p>Failed to load users data.</p>
        </div>
      </div>
    );
  }
}
