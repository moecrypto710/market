import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create Postgres connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString!);

// Create Drizzle client
export const db = drizzle(client, { schema });

// Create session table for session storage
export async function initSessionTable() {
  try {
    console.log("Creating session table if it doesn't exist...");
    await client`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" VARCHAR NOT NULL PRIMARY KEY,
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL
      )
    `;
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
    
    // In a production app, we would use drizzle-kit to handle migrations
    // For this demo we're just ensuring the session table exists
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}