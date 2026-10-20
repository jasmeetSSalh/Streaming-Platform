import { createClient } from "@libsql/client";
import { hashPassword } from "../src/lib/password";

const plans = `INSERT OR IGNORE INTO plans (id, name, monthly_price, access_level, description) VALUES
  ('plan-free', 'FREE', 0, 'FREE', 'Explore the catalog with limited access.'),
  ('plan-basic', 'BASIC', 9.99, 'BASIC', 'Full catalog access for everyday viewing.'),
  ('plan-premium', 'PREMIUM', 14.99, 'PREMIUM', 'Everything in Basic, including premium titles.');`;

const seedTitles = [
	["title-01", "The Last Horizon", "MOVIE", "Science Fiction", "A crew races a collapsing star to bring a colony ship home.", 2024, "Amara Cole, Jonah Voss, Priya Nair"],
	["title-02", "Cedar Falls", "SHOW", "Drama", "A small town keeps a river secret that reshapes every family on its banks.", 2021, "Helen Ward, Marcus Bell, June Ortiz"],
	["title-03", "After Midnight", "MOVIE", "Thriller", "A night-shift dispatcher hears a call that should not exist.", 2023, "Leah Kim, Dominic Hale"],
	["title-04", "Northbound", "MOVIE", "Adventure", "Two estranged siblings hike a winter trail they swore never to finish.", 2022, "Sam Reed, Ivy Chen"],
	["title-05", "Harbor Light", "SHOW", "Mystery", "A coastal detective maps disappearances to the tide tables.", 2020, "Nora Blake, Ellis Grant, Tomi Ade"],
	["title-06", "Glass Orchard", "MOVIE", "Romance", "A glassblower and a botanist rebuild a greenhouse after a storm.", 2019, "Clara Mendez, Theo Park"],
	["title-07", "Signal Lost", "SHOW", "Science Fiction", "Radio operators on a remote island catch messages from tomorrow.", 2024, "Ravi Shah, Quinn Adler"],
	["title-08", "Paper Kingdoms", "MOVIE", "Family", "A librarian and her niece fold maps into a living city.", 2018, "Ruth Ellison, Mia Brooks"],
	["title-09", "Iron County", "SHOW", "Crime", "A former mill town hunts a thief who only steals memories.", 2022, "Frank Doyle, Sasha Wren"],
	["title-10", "Second Bloom", "MOVIE", "Comedy", "Rival florists share a storefront and a disastrous wedding season.", 2021, "Nina Patel, George Lane"],
	["title-11", "Redline Atlas", "MOVIE", "Action", "A courier must cross four closed borders with one sealed envelope.", 2025, "Alex Mora, Yuki Tanaka"],
	["title-12", "Moonlit Kitchen", "SHOW", "Comedy", "Night cooks invent a secret menu that starts changing patrons' luck.", 2023, "Chef Lin, Omar Diaz, Bea Holloway"],
	["title-13", "The Quiet Score", "MOVIE", "Drama", "A retired pianist agrees to compose for a student who cannot hear her own work.", 2017, "Elena Rossi, Daniel Cho"],
	["title-14", "Saltroad", "SHOW", "Adventure", "Traders sail a desert that floods once each century.", 2020, "Khalid Noor, Wren Ellis"],
	["title-15", "Static Garden", "MOVIE", "Horror", "A radio station's greenhouse grows plants that replay the last broadcast.", 2024, "Mara Voss, Ian Creed"],
	["title-16", "West of June", "SHOW", "Western", "A surveyor redraws a county line and uncovers a town that was never mapped.", 2019, "Cal Harper, Lila Stone"],
	["title-17", "Brightwater", "MOVIE", "Documentary", "A filmmaker follows a river restoration that splits a valley in two.", 2022, "Narrated by Jordan Hale"],
	["title-18", "Echo Protocol", "SHOW", "Thriller", "An archive clerk finds her own voice in recordings from the future.", 2025, "Sienna Park, Cole Brennan"],
	["title-19", "Larkspur Station", "MOVIE", "Mystery", "Passengers wait overnight at a depot that no longer appears on any schedule.", 2016, "Henry Walsh, Ada Flores"],
	["title-20", "Copper Sky", "SHOW", "Science Fiction", "Miners on a dying moon bargain with the last working satellite.", 2021, "Tess Okonkwo, Ben Ibarra"],
	["title-21", "Sunday Mechanics", "MOVIE", "Family", "Kids open a repair shop that only fixes things people have given up on.", 2018, "Ollie Grant, Sage Patel, Kim Rivera"],
	["title-22", "Night Market", "SHOW", "Fantasy", "A floating bazaar appears when the city forgets a promise.", 2023, "Jin Park, Rosa Velez, The Merchant"],
] as const;

const seedReviews = [
	["review-01", "user-seed-reviewer", "title-01", 5],
	["review-02", "user-seed-reviewer-2", "title-01", 4],
	["review-03", "user-seed-reviewer", "title-03", 4],
	["review-04", "user-seed-reviewer", "title-05", 5],
	["review-05", "user-seed-reviewer", "title-10", 3],
	["review-06", "user-seed-reviewer", "title-22", 5],
] as const;

async function main() {
	const client = createClient({ url: process.env.DATABASE_URL ?? "file:./data/streaming.db" });
	await client.execute(plans);

	const now = Math.floor(Date.now() / 1000);
	const passwordHash = await hashPassword("SeedReviewer1!");
	await client.execute({
		sql: `INSERT OR IGNORE INTO users (id, name, email, password_hash, role, created_at) VALUES
      ('user-seed-reviewer', 'Seed Reviewer', 'reviewer@streamly.local', ?, 'USER', ?),
      ('user-seed-reviewer-2', 'Seed Reviewer Two', 'reviewer2@streamly.local', ?, 'USER', ?)`,
		args: [passwordHash, now, passwordHash, now],
	});

	for (const [index, title] of seedTitles.entries()) {
		const [id, name, type, genre, synopsis, year, cast] = title;
		await client.execute({
			sql: `INSERT OR IGNORE INTO titles (id, name, type, genre, synopsis, cast, poster_url, release_year, required_plan, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'FREE', ?)`,
			args: [id, name, type, genre, synopsis, cast, `https://picsum.photos/seed/${id}/400/600`, year, now - index],
		});
		await client.execute({
			sql: `UPDATE titles SET "cast" = ? WHERE id = ? AND ("cast" IS NULL OR "cast" = '')`,
			args: [cast, id],
		});
	}

	for (const [id, userId, titleId, rating] of seedReviews) {
		await client.execute({
			sql: `INSERT OR IGNORE INTO reviews (id, user_id, title_id, rating, body, created_at)
        VALUES (?, ?, ?, ?, NULL, ?)`,
			args: [id, userId, titleId, rating, now],
		});
	}

	client.close();
	console.log("Seeded default subscription plans, catalog titles, and sample ratings.");
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
