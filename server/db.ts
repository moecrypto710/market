import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

// Create SQL client
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle client
export const db = drizzle(sql);

// Create session table for session storage
export async function initSessionTable() {
  try {
    console.log("Creating session table if it doesn't exist...");
    await sql(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" VARCHAR NOT NULL PRIMARY KEY,
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL
      )
    `);
    console.log("Session table is ready");
    return true;
  } catch (error) {
    console.error("Failed to create session table:", error);
    return false;
  }
}

// Initialize database schema
export async function initDatabase() {
  try {
    // Create session table
    await initSessionTable();
    
    // Push schema (in a production app, you would use drizzle-kit to handle migrations)
    // For this demo, we're using a simplified approach
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}