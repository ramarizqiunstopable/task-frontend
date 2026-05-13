import { getUser, getUserPosts, getUserTodos } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User as UserIcon, Briefcase, MapPin, Mail, Phone, Globe } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const user = await getUser(id);
    if (!user) return { title: 'User Not Found' };
    
    return {
      title: `${user.name} (@${user.username}) | User Profile`,
      description: `View profile and activity for ${user.name} from ${user.company.name}.`,
    };
  } catch (e) {
    return { title: 'User Profile' };
  }
}

export default async function UserDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  
  const queryStr = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => queryStr.append(key, v));
    } else if (value) {
      queryStr.set(key, value);
    }
  });
  const queryString = queryStr.toString();
  const backHref = queryString ? `/users?${queryString}` : '/users';

  // Parallel fetch without silencing errors so Error Boundary can catch them
  const [user, posts, todos] = await Promise.all([
    getUser(id),
    getUserPosts(id),
    getUserTodos(id),
  ]);

  if (!user) {
    notFound();
  }

  const completedTodos = todos.filter(t => t.completed);
  const pendingTodos = todos.filter(t => !t.completed);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-6">
      <Link 
        href={backHref} 
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke daftar user
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${user.email}`} className="hover:underline hover:text-primary truncate">{user.email}</a>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Globe className="h-4 w-4 mr-2" />
                  <a href={`http://${user.website}`} target="_blank" rel="noreferrer" className="hover:underline hover:text-primary truncate">
                    {user.website}
                  </a>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center font-medium text-sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Company
                </div>
                <div className="pl-6 text-sm">
                  <p className="font-semibold">{user.company.name}</p>
                  <p className="text-muted-foreground italic">&quot;{user.company.catchPhrase}&quot;</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center font-medium text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Address
                </div>
                <div className="pl-6 text-sm text-muted-foreground">
                  <p>{user.address.street}, {user.address.suite}</p>
                  <p>{user.address.city}, {user.address.zipcode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Activity Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">{posts.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Posts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{completedTodos.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Completed Todos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-destructive">{pendingTodos.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Pending Todos</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Todos Section */}
            <Card className="flex flex-col h-[500px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Todos</span>
                  <Badge variant="outline">{todos.length}</Badge>
                </CardTitle>
                <CardDescription>User's task list</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-6 pb-6">
                  <div className="space-y-4">
                    {todos.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No todos found.</p>
                    ) : (
                      todos.map(todo => (
                        <div key={todo.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                          <div className="mt-0.5">
                            {todo.completed ? (
                              <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                              </div>
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-destructive" />
                            )}
                          </div>
                          <p className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                            {todo.title}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Posts Section */}
            <Card className="flex flex-col h-[500px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Posts</span>
                  <Badge variant="outline">{posts.length}</Badge>
                </CardTitle>
                <CardDescription>Articles published by the user</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-6 pb-6">
                  <div className="space-y-4">
                    {posts.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No posts found.</p>
                    ) : (
                      posts.map(post => (
                        <div key={post.id} className="p-4 rounded-lg border bg-card space-y-2">
                          <h4 className="font-semibold text-sm line-clamp-1">{post.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3">{post.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
