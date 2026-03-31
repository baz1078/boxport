import Link from "next/link";
import { Package } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-3">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-primary">Box</span>
              <span className="text-accent -ml-1">Port</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The US marketplace for buying and selling shipping containers.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Marketplace</h3>
            <ul className="space-y-2">
              {[
                { href: "/listings", label: "Browse Containers" },
                { href: "/listings?condition=one_trip", label: "One-Trip Containers" },
                { href: "/listings?type=reefer", label: "Reefer Containers" },
                { href: "/listings?type=40ft_high_cube", label: "40ft High Cube" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Sellers</h3>
            <ul className="space-y-2">
              {[
                { href: "/auth/register", label: "Start Selling" },
                { href: "/pricing", label: "Pricing & Plans" },
                { href: "/how-it-works", label: "How It Works" },
                { href: "/dashboard", label: "Seller Dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Company</h3>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About BoxPort" },
                { href: "/contact", label: "Contact Us" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BoxPort. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            A 4.9% fee applies to all transactions. Listings are free.
          </p>
        </div>
      </div>
    </footer>
  );
}
