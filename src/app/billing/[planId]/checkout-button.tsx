"use client";

import { useState } from "react";

export function CheckoutButton({ planId, isFree }: { planId: string; isFree: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const result: unknown = await response.json();

      if (
        typeof result !== "object" ||
        result === null ||
        !("url" in result) ||
        typeof result.url !== "string"
      ) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Unable to start checkout. Please try again.";
        throw new Error(message);
      }
      if (!response.ok) {
        throw new Error("Unable to start checkout. Please try again.");
      }

      window.location.assign(result.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to start checkout.");
      setPending(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        className="rounded-lg bg-violet-700 px-5 py-3 font-medium text-white hover:bg-violet-800 disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        onClick={startCheckout}
        type="button"
      >
        {pending
          ? "Preparing checkout…"
          : isFree
            ? "Start free plan"
            : "Continue to secure checkout"}
      </button>
      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
