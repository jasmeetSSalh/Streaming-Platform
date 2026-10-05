import { createClient } from "@libsql/client";

const plans = `INSERT OR IGNORE INTO plans (id, name, monthly_price, access_level, description) VALUES
  ('plan-free', 'FREE', 0, 'FREE', 'Explore the catalog with limited access.'),
  ('plan-basic', 'BASIC', 9.99, 'BASIC', 'Full catalog access for everyday viewing.'),
  ('plan-premium', 'PREMIUM', 14.99, 'PREMIUM', 'Everything in Basic, including premium titles.');`;

const seedTitles = [
	["title-01", "The Last Horizon", "MOVIE", "Science Fiction", "A crew races a collapsing star to bring a colony ship home.", 2024],
	["title-02", "Cedar Falls", "SHOW", "Drama", "A small town keeps a river secret that reshapes every family on its banks.", 2021],
	["title-03", "After Midnight", "MOVIE", "Thriller", "A night-shift dispatcher hears a call that should not exist.", 2023],
	["title-04", "Northbound", "MOVIE", "Adventure", "Two estranged siblings hike a winter trail they swore never to finish.", 2022],
	["title-05", "Harbor Light", "SHOW", "Mystery", "A coastal detective maps disappearances to the tide tables.", 2020],
	["title-06", "Glass Orchard", "MOVIE", "Romance", "A glassblower and a botanist rebuild a greenhouse after a storm.", 2019],
	["title-07", "Signal Lost", "SHOW", "Science Fiction", "Radio operators on a remote island catch messages from tomorrow.", 2024],
	["title-08", "Paper Kingdoms", "MOVIE", "Family", "A librarian and her niece fold maps into a living city.", 2018],
	["title-09", "Iron County", "SHOW", "Crime", "A former mill town hunts a thief who only steals memories.", 2022],
	["title-10", "Second Bloom", "MOVIE", "Comedy", "Rival florists share a storefront and a disastrous wedding season.", 2021],
	["title-11", "Redline Atlas", "MOVIE", "Action", "A courier must cross four closed borders with one sealed envelope.", 2025],
	["title-12", "Moonlit Kitchen", "SHOW", "Comedy", "Night cooks invent a secret menu that starts changing patrons' luck.", 2023],
	["title-13", "The Quiet Score", "MOVIE", "Drama", "A retired pianist agrees to compose for a student who cannot hear her own work.", 2017],
	["title-14", "Saltroad", "SHOW", "Adventure", "Traders sail a desert that floods once each century.", 2020],
	["title-15", "Static Garden", "MOVIE", "Horror", "A radio station's greenhouse grows plants that replay the last broadcast.", 2024],
	["title-16", "West of June", "SHOW", "Western", "A surveyor redraws a county line and uncovers a town that was never mapped.", 2019],
	["title-17", "Brightwater", "MOVIE", "Documentary", "A filmmaker follows a river restoration that splits a valley in two.", 2022],
	["title-18", "Echo Protocol", "SHOW", "Thriller", "An archive clerk finds her own voice in recordings from the future.", 2025],
	["title-19", "Larkspur Station", "MOVIE", "Mystery", "Passengers wait overnight at a depot that no longer appears on any schedule.", 2016],
	["title-20", "Copper Sky", "SHOW", "Science Fiction", "Miners on a dying moon bargain with the last working satellite.", 2021],
	["title-21", "Sunday Mechanics", "MOVIE", "Family", "Kids open a repair shop that only fixes things people have given up on.", 2018],
	["title-22", "Night Market", "SHOW", "Fantasy", "A floating bazaar appears when the city forgets a promise.", 2023],
] as const;

async function main() {
	const client = createClient({ url: process.env.DATABASE_URL ?? "file:./data/streaming.db" });
	await client.execute(plans);

	const now = Math.floor(Date.now() / 1000);
	for (const [index, title] of seedTitles.entries()) {
		const [id, name, type, genre, synopsis, year] = title;
		await client.execute({
			sql: `INSERT OR IGNORE INTO titles (id, name, type, genre, synopsis, cast, poster_url, release_year, required_plan, created_at)
        VALUES (?, ?, ?, ?, ?, '', ?, ?, 'FREE', ?)`,
			args: [id, name, type, genre, synopsis, `https://picsum.photos/seed/${id}/400/600`, year, now - index],
		});
	}

	client.close();
	console.log("Seeded default subscription plans and catalog titles.");
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
