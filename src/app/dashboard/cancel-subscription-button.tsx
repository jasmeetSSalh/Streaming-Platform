"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancelSubscription() {
    if (
      !window.confirm(
        "Cancel this subscription at the end of the current billing period? You’ll keep access until then.",
      )
    ) {
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/subscription/cancel", { method: "POST" });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Unable to schedule cancellation. Please try again.";
        throw new Error(message);
      }
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to schedule cancellation.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        className="text-sm font-medium text-red-700 underline decoration-red-300 underline-offset-4 hover:text-red-900 disabled:opacity-60"
        disabled={pending}
        onClick={cancelSubscription}
        type="button"
      >
        {pending ? "Scheduling cancellation…" : "Cancel subscription"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
