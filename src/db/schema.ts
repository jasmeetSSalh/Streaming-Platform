import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
export const users = sqliteTable("users", { id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull().unique(), passwordHash: text("password_hash").notNull(), role: text("role", { enum: ["USER", "ADMIN"] }).notNull().default("USER"), createdAt: integer("created_at", { mode: "timestamp" }).notNull() });
export const sessions = sqliteTable("sessions", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), tokenHash: text("token_hash").notNull().unique(), expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(), createdAt: integer("created_at", { mode: "timestamp" }).notNull() });
export const plans = sqliteTable("plans", { id: text("id").primaryKey(), name: text("name", { enum: ["FREE", "BASIC", "PREMIUM"] }).notNull().unique(), monthlyPrice: real("monthly_price").notNull(), accessLevel: text("access_level", { enum: ["FREE", "BASIC", "PREMIUM"] }).notNull(), description: text("description").notNull() });
export const titles = sqliteTable("titles", { id: text("id").primaryKey(), name: text("name").notNull(), type: text("type", { enum: ["MOVIE", "SHOW"] }).notNull(), genre: text("genre").notNull(), synopsis: text("synopsis").notNull(), cast: text("cast").notNull(), posterUrl: text("poster_url"), releaseYear: integer("release_year").notNull(), viewCount: integer("view_count").notNull().default(0), requiredPlan: text("required_plan", { enum: ["FREE", "BASIC", "PREMIUM"] }).notNull().default("FREE"), createdAt: integer("created_at", { mode: "timestamp" }).notNull() });
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  planId: text("plan_id").notNull().references(() => plans.id),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  status: text("status", { enum: ["ACTIVE", "CANCELLED", "EXPIRED"] }).notNull().default("ACTIVE"),
  cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" }).notNull().default(false),
  currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp" }),
});
export const subscriptionPlanChanges = sqliteTable("subscription_plan_changes", {
  id: text("id").primaryKey(),
  subscriptionId: text("subscription_id").notNull().references(() => subscriptions.id),
  userId: text("user_id").notNull().references(() => users.id),
  fromPlanId: text("from_plan_id").notNull().references(() => plans.id),
  toPlanId: text("to_plan_id").notNull().references(() => plans.id),
  changedAt: integer("changed_at", { mode: "timestamp" }).notNull(),
}, (table) => [index("subscription_plan_changes_user_changed_at_idx").on(table.userId, table.changedAt), index("subscription_plan_changes_subscription_idx").on(table.subscriptionId)]);
export const watchlistItems = sqliteTable("watchlist_items", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), titleId: text("title_id").notNull().references(() => titles.id), createdAt: integer("created_at", { mode: "timestamp" }).notNull() }, (table) => [uniqueIndex("watchlist_user_title_idx").on(table.userId, table.titleId)]);
export const titleViews = sqliteTable("title_views", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), titleId: text("title_id").notNull().references(() => titles.id), viewedAt: integer("viewed_at", { mode: "timestamp" }).notNull() }, (table) => [uniqueIndex("title_views_user_title_idx").on(table.userId, table.titleId), index("title_views_user_viewed_at_idx").on(table.userId, table.viewedAt)]);
export const reviews = sqliteTable("reviews", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), titleId: text("title_id").notNull().references(() => titles.id), rating: integer("rating").notNull(), body: text("body"), createdAt: integer("created_at", { mode: "timestamp" }).notNull() }, (table) => [uniqueIndex("review_user_title_idx").on(table.userId, table.titleId)]);
