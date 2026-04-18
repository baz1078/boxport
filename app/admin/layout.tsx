import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Package, MessageSquare, Plus, LogOut } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/listings", label: "Listings", icon: Package },
    { href: "/admin/offers", label: "Offers", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-56 bg-background border-r flex flex-col shrink-0">
        <div className="p-5 border-b">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">BoxPort</p>
          <p className="text-sm font-bold mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

          <div className="pt-2 border-t mt-2">
            <Link
              href="/admin/listings/new"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Listing
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
