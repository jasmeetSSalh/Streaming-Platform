import { createClient } from "@libsql/client";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run db:promote-admin -- <email>");
    process.exitCode = 1;
    return;
  }

  const client = createClient({ url: process.env.DATABASE_URL ?? "file:./data/streaming.db" });
  try {
    const result = await client.execute({
      sql: "UPDATE users SET role = 'ADMIN' WHERE lower(email) = ? RETURNING id, name, email, role",
      args: [email],
    });

    if (result.rows.length === 0) {
      console.error(`No user found with email: ${email}`);
      process.exitCode = 1;
      return;
    }

    for (const user of result.rows) {
      console.log(`Promoted ${user.email} (${user.name}) to ${user.role}.`);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Could not promote user:", error);
  process.exitCode = 1;
});
