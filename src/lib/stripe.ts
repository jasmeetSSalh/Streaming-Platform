import "server-only";
import Stripe from "stripe";

let stripe: Stripe | undefined;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  stripe ??= new Stripe(secretKey);
  return stripe;
}

export function getAppUrl() {
  const appUrl = process.env.APP_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");
  if (!appUrl) {
    throw new Error("APP_URL must be set in production.");
  }

  const url = new URL(appUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("APP_URL must use HTTP or HTTPS.");
  }
  return url.origin;
}
