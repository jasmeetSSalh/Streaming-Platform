import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({ url: process.env.DATABASE_URL ?? "file:./data/streaming.db" });
  await client.execute(`INSERT OR IGNORE INTO plans (id, name, monthly_price, access_level, description) VALUES ('plan-free', 'FREE', 0, 'FREE', 'Explore the catalog with limited access.'), ('plan-basic', 'BASIC', 9.99, 'BASIC', 'Full catalog access for everyday viewing.'), ('plan-premium', 'PREMIUM', 14.99, 'PREMIUM', 'Everything in Basic, including premium titles.');`);
  client.close();
  console.log("Seeded default subscription plans.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
