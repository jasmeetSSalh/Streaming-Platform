import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Streamly",
  description: "Movie and show subscription platform",
};

const navLinks = [
  { href: "/catalog", label: "Catalog" },
  { href: "/plans", label: "Plans" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
];

const navLinkClass =
  "relative transition-all duration-200 hover:-translate-y-0.5 hover:text-rose-600 active:translate-y-0 active:scale-95 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-600 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-rose-600 after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100 focus-visible:after:scale-x-100";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
            <Link className="font-bold tracking-tight text-slate-950" href="/">
              Streamly
            </Link>
            <div className="flex gap-5 text-sm font-medium text-slate-600">
              {navLinks.map(({ href, label }) => (
                <Link className={navLinkClass} href={href} key={href}>
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
