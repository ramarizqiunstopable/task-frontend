'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CombinedUser } from '@/lib/api';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

type UsersClientProps = {
  initialUsers: CombinedUser[];
};

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(search, 300);
  
  const sort = searchParams.get('sort') || 'name_asc';
  const filter = searchParams.get('filter') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  // Sync debounced search to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentQ = searchParams.get('q') || '';
    
    if (debouncedSearch !== currentQ) {
      if (debouncedSearch) {
        params.set('q', debouncedSearch);
      } else {
        params.delete('q');
      }
      params.set('page', '1');
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...initialUsers];

    // Filter by search (name or email)
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q)
      );
    }

    // Additional filters
    if (filter === 'pending_only') {
      result = result.filter((user) => user.pendingTodos > 0);
    } else if (filter === 'no_completed') {
      result = result.filter((user) => user.completedTodos === 0);
    }

    // Sorting
    result.sort((a, b) => {
      if (sort === 'name_asc') {
        return a.name.localeCompare(b.name);
      } else if (sort === 'name_desc') {
        return b.name.localeCompare(a.name);
      } else if (sort === 'pending_desc') {
        return b.pendingTodos - a.pendingTodos;
      }
      return 0;
    });

    return result;
  }, [initialUsers, debouncedSearch, filter, sort]);

  const ITEMS_PER_PAGE = limit;
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  
  const paginatedUsers = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedUsers, validCurrentPage]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">User Operations</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="relative md:col-span-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search name or email..."
            className="pl-9 bg-background w-full h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="md:col-span-3">
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filter}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('filter', e.target.value);
              params.set('page', '1');
              router.replace(`${pathname}?${params.toString()}`);
            }}
          >
            <option value="all">All Users</option>
            <option value="pending_only">Has Pending Todos</option>
            <option value="no_completed">No Completed Todos</option>
          </select>
        </div>
        
        <div className="md:col-span-3">
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={sort}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('sort', e.target.value);
              params.set('page', '1');
              router.replace(`${pathname}?${params.toString()}`);
            }}
          >
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="name_desc">Sort: Name (Z-A)</option>
            <option value="pending_desc">Sort: Most Pending Todos</option>
          </select>
        </div>
      </div>

      {filteredAndSortedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20 border-dashed">
          <p className="text-muted-foreground mb-2">No users found matching your filters.</p>
          <button 
            className="text-primary hover:underline text-sm"
            onClick={() => {
              setSearch('');
              const params = new URLSearchParams();
              router.replace(`${pathname}?${params.toString()}`);
            }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop View: Table */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Activity Signals</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="group cursor-pointer hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => router.push(`/users/${user.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        router.push(`/users/${user.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">
                      <span className="group-hover:text-primary transition-colors">
                        {user.name}
                      </span>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <a href={`http://${user.website}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:underline">
                        {user.website}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="secondary" title="Total Posts">P: {user.totalPosts}</Badge>
                        <Badge variant="outline" className="text-green-600" title="Completed Todos">✓ {user.completedTodos}</Badge>
                        <Badge variant="destructive" title="Pending Todos">⏱ {user.pendingTodos}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View: Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedUsers.map((user) => (
              <Card 
                key={user.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => router.push(`/users/${user.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/users/${user.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
                  }
                }}
              >
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg text-primary">
                    {user.name}
                  </CardTitle>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground flex flex-col gap-1">
                    <span>Email: {user.email}</span>
                    <span>
                      Web:{' '}
                      <a href={`http://${user.website}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:underline">
                        {user.website}
                      </a>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Badge variant="secondary">Posts: {user.totalPosts}</Badge>
                    <Badge variant="outline" className="text-green-600">Done: {user.completedTodos}</Badge>
                    <Badge variant="destructive">Pending: {user.pendingTodos}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between border-t pt-4 mt-6 gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap justify-center">
              <div>
                Showing <span className="font-medium">{(validCurrentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredAndSortedUsers.length)}</span> of <span className="font-medium">{filteredAndSortedUsers.length}</span> results
              </div>
              <div className="flex items-center gap-2 border-l pl-4 border-border">
                <span>Rows per page:</span>
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={limit}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('limit', e.target.value);
                    params.set('page', '1');
                    router.replace(`${pathname}?${params.toString()}`);
                  }}
                >
                  <option value="3">3</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                </select>
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(validCurrentPage - 1)}
                  disabled={validCurrentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={validCurrentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      className="w-8"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(validCurrentPage + 1)}
                  disabled={validCurrentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
