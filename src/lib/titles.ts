import { titles } from "@/db/schema";

export const TITLE_TYPES = ["MOVIE", "SHOW"] as const;
export const PLAN_LEVELS = ["FREE", "BASIC", "PREMIUM"] as const;

export type TitleType = (typeof TITLE_TYPES)[number];
export type PlanLevel = (typeof PLAN_LEVELS)[number];
export type TitleRow = typeof titles.$inferSelect;

export type TitlePayload = {
	name: string;
	type: TitleType;
	genre: string;
	synopsis: string;
	cast: string;
	posterUrl: string | null;
	releaseYear: number;
	requiredPlan: PlanLevel;
};

export type PublicTitle = {
	id: string;
	name: string;
	type: TitleType;
	genre: string;
	synopsis: string;
	cast: string;
	posterUrl: string | null;
	releaseYear: number;
	requiredPlan: PlanLevel;
	createdAt: string;
};

const currentYear = new Date().getFullYear();

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
	return typeof value === "string" ? value.trim() : "";
}

function isHttpUrl(value: string) {
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

export function parseTitleInput(body: unknown): { data: TitlePayload } | { error: string } {
	if (!isRecord(body)) {
		return { error: "A JSON body is required." };
	}

	const name = readString(body.name ?? body.title);
	const genre = readString(body.genre);
	const synopsis = readString(body.synopsis ?? body.description);
	const typeValue = readString(body.type).toUpperCase();
	const posterValue = readString(body.posterUrl ?? body.posterURL);
	const cast = readString(body.cast);
	const requiredPlanValue = readString(body.requiredPlan).toUpperCase() || "FREE";

	const yearRaw = body.releaseYear;
	const releaseYear =
		typeof yearRaw === "number"
			? yearRaw
			: typeof yearRaw === "string" && yearRaw.trim()
				? Number(yearRaw)
				: Number.NaN;

	if (!name) {
		return { error: "Title is required." };
	}

	if (!TITLE_TYPES.includes(typeValue as TitleType)) {
		return { error: "Type must be MOVIE or SHOW." };
	}

	if (!genre) {
		return { error: "Genre is required." };
	}

	if (!synopsis) {
		return { error: "Description is required." };
	}

	if (!Number.isInteger(releaseYear) || releaseYear < 1888 || releaseYear > currentYear + 5) {
		return { error: "Release year must be a valid year." };
	}

	if (posterValue && !isHttpUrl(posterValue)) {
		return { error: "Poster URL must be a valid http(s) address." };
	}

	if (!PLAN_LEVELS.includes(requiredPlanValue as PlanLevel)) {
		return { error: "Required plan must be FREE, BASIC, or PREMIUM." };
	}

	return {
		data: {
			name,
			type: typeValue as TitleType,
			genre,
			synopsis,
			cast,
			posterUrl: posterValue || null,
			releaseYear,
			requiredPlan: requiredPlanValue as PlanLevel,
		},
	};
}

export function toPublicTitle(row: TitleRow): PublicTitle {
	return {
		id: row.id,
		name: row.name,
		type: row.type,
		genre: row.genre,
		synopsis: row.synopsis,
		cast: row.cast,
		posterUrl: row.posterUrl,
		releaseYear: row.releaseYear,
		requiredPlan: row.requiredPlan,
		createdAt: row.createdAt.toISOString(),
	};
}
