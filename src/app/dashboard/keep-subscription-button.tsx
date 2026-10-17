"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function KeepSubscriptionButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function keepSubscription() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/subscription/renew", { method: "POST" });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Unable to keep your subscription active. Please try again.";
        throw new Error(message);
      }
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to keep your subscription active.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        className="rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
        disabled={pending}
        onClick={keepSubscription}
        type="button"
      >
        {pending ? "Updating subscription…" : "Keep subscription"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
