export const WATCHLIST_PREVIEW_LIMIT = 5;

type SubscriptionStatusInput = {
	stripeSubscriptionId: string | null;
	cancelAtPeriodEnd: boolean;
	currentPeriodEnd: Date | null;
};

/** One-line renewal/status summary for the dashboard plan card. */
export function describeRenewal(subscription: SubscriptionStatusInput | null | undefined) {
	if (!subscription) return { label: "No active plan", date: null };
	if (!subscription.stripeSubscriptionId) return { label: "Free plan, no renewal needed", date: null };
	if (subscription.cancelAtPeriodEnd) return { label: "Access ends on", date: subscription.currentPeriodEnd };
	if (subscription.currentPeriodEnd) return { label: "Renews on", date: subscription.currentPeriodEnd };
	return { label: "Renewal date pending", date: null };
}
