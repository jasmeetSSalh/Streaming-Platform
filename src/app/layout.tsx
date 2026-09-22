import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Streamly",
  description: "Movie and show subscription platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white"><nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10"><Link className="font-bold tracking-tight text-slate-950" href="/">Streamly</Link><div className="flex gap-5 text-sm font-medium text-slate-600"><Link href="/catalog">Catalog</Link><Link href="/plans">Plans</Link><Link href="/dashboard">Dashboard</Link><Link href="/admin">Admin</Link></div></nav></header>
        {children}
      </body>
    </html>
  );
}
