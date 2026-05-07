"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, Package, ChevronDown, LayoutDashboard, LogOut, User, Star, Wrench, CalendarClock, LayoutList } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const BROWSE_CATEGORIES = [
  { href: "/listings?category=new", label: "New Containers", sub: "One-trip, factory-fresh", Icon: Star },
  { href: "/listings?category=used", label: "Used Containers", sub: "Cargo worthy, WWT, As-Is", Icon: Wrench },
  { href: "/listings?category=rent-to-own", label: "Rent-to-Own", sub: "Monthly payments → ownership", Icon: CalendarClock },
  { href: "/listings", label: "All Containers", sub: "Browse everything", Icon: LayoutList },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-primary">Box</span>
            <span className="text-accent -ml-1">Port</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
                Browse <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2">
                {BROWSE_CATEGORIES.map(({ href, label, sub, Icon }) => (
                  <DropdownMenuItem key={href} onClick={() => window.location.assign(href)} className="flex items-start gap-3 px-2 py-2.5 rounded-md cursor-pointer">
                    <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/logistics"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Logistics
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard/listings/new">+ List a Container</a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image ?? ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium">{session.user.name}</div>
                    <div className="px-2 pb-1.5 text-xs text-muted-foreground">{session.user.email}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.assign("/dashboard")} className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.assign("/dashboard/profile")} className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 text-destructive cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Link href="/auth/register">List a Container</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">Browse</p>
            {BROWSE_CATEGORIES.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 text-sm font-medium py-2 px-2 rounded-md hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </Link>
            ))}
            <div className="border-t border-border my-1" />
            <Link href="/logistics" className="text-sm font-medium py-2 px-2" onClick={() => setMobileOpen(false)}>
              Logistics
            </Link>
            <Link href="/pricing" className="text-sm font-medium py-2 px-2" onClick={() => setMobileOpen(false)}>
              Pricing
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium py-2 px-2" onClick={() => setMobileOpen(false)}>
              How It Works
            </Link>
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              {session?.user ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Link href="/auth/register">List a Container</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
