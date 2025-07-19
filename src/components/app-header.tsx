"use client";

import { useAuth } from "@/hooks/use-auth";
import { LogOut, UserCircle, BookOpen, LayoutDashboard, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getDashboardLink = () => `/${user?.role}/dashboard`;
  const getClassroomsLink = () => `/${user?.role}/classrooms`;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg font-bold">LearnifyAI</span>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-4">
            <Link href={getDashboardLink()} passHref>
              <Button variant="link" className={cn("gap-2 text-muted-foreground", pathname.includes("dashboard") && "text-primary font-semibold")}>
                <LayoutDashboard /> Dashboard
              </Button>
            </Link>
            {user.role === 'teacher' && (
              <Link href={getClassroomsLink()} passHref>
                <Button variant="link" className={cn("gap-2 text-muted-foreground", pathname.includes("classrooms") && "text-primary font-semibold")}>
                  <School /> Classrooms
                </Button>
              </Link>
            )}
          </nav>
        )}

        <div className="flex flex-1 items-center justify-end space-x-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <UserCircle className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile" passHref>
                    <DropdownMenuItem className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
        </div>
      </div>
    </header>
  );
}
