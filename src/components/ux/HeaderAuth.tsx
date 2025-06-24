'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/lib/actions/auth';
import { useUser } from '@/lib/providers/UserContext';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthButton() {
  const [loading, setLoading] = useState(true);
  const initialLoad = useRef(true);
  const context = useUser();

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
    } else {
      setLoading(false);
    }
  }, [context]);

  if (loading) {
    return <Skeleton className="w-32 h-4" />;
  }

  return context ? (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">{context.email}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/">
              <DropdownMenuItem>Home</DropdownMenuItem>
            </Link>
            <Link href="/users">
              <DropdownMenuItem>Users</DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <form action={signOutAction}>
            <button type="submit" className="w-full">
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm">
        <Link href="/auth/login">Login</Link>
      </Button>
    </div>
  );
}
