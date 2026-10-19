"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SubscriptionPending() {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), 2500);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 30000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [router]);

  return (
    <aside
      className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
      role="status"
    >
      <p>Checkout completed. Stripe is confirming your subscription.</p>
      <button
        className="mt-2 font-medium underline"
        onClick={() => router.refresh()}
        type="button"
      >
        Refresh status
      </button>
    </aside>
  );
}
