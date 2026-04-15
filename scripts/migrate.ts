import "dotenv/config";
import fs from "node:fs";
import { neon } from "@neondatabase/serverless";

async function main() {
  // biome-ignore lint/style/noNonNullAssertion: IGNORE
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Applying 0001...");
  try {
    const q1 = fs.readFileSync("./drizzle/0001_curved_joseph.sql", "utf-8");
    for (const stmt of q1.split("--> statement-breakpoint")) {
      await sql.query(stmt);
    }
  } catch (e) {
    console.log("0001 failed, might be already applied: ", e);
  }

  console.log("Applying 0002...");
  try {
    const q2 = fs.readFileSync("./drizzle/0002_lonely_doorman.sql", "utf-8");
    for (const stmt of q2.split("--> statement-breakpoint")) {
      await sql.query(stmt);
    }
  } catch (e) {
    console.log("0002 failed, might be already applied: ", e);
  }

  console.log("Done.");
}

main().catch(console.error);
