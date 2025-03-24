import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Create SQL client
export const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle client
export const db = drizzle(sql, { schema });

// Run migrations (creates tables if they don't exist)
export async function runMigrations() {
  try {
    const migrationDB = drizzle(migrationClient);
    console.log("Running migrations...");
    await migrate(migrationDB, { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Initialize database
export async function initDatabase() {
  try {
    await runMigrations();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}