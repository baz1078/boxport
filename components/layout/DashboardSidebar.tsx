"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  CreditCard,
  User,
  Crown,
  LogOut,
  Plus,
  Bell,
  Package2,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/listings", label: "My Listings", icon: Package },
  { href: "/dashboard/offers", label: "Offers", icon: MessageSquare },
  { href: "/dashboard/transactions", label: "Transactions", icon: CreditCard },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/subscription", label: "Subscription", icon: Crown },
];

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    subscriptionTier?: string;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "?";

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <a href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 bg-sidebar-primary rounded-md flex items-center justify-center">
            <Package2 className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-sidebar-foreground">Box</span>
          <span className="text-sidebar-primary -ml-1">Port</span>
        </a>
      </div>

      {/* Quick Action */}
      <div className="p-4 border-b border-sidebar-border">
        <a
          href="/dashboard/listings/new"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold hover:bg-sidebar-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          List a Container
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <div className="flex items-center gap-1.5">
              {user.subscriptionTier === "pro" ? (
                <Badge className="text-[10px] px-1.5 py-0 bg-sidebar-primary text-sidebar-primary-foreground">
                  PRO
                </Badge>
              ) : (
                <span className="text-[10px] text-sidebar-foreground/50">Free Plan</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
