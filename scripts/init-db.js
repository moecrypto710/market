const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

async function initializeDatabase() {
  console.log('Initializing database...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  // Create postgres client
  const sql = postgres(connectionString, { debug: true });
  
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL commands
    console.log('Creating tables and sample data...');
    await sql.unsafe(sqlContent);
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await sql.end();
  }
}

// Run the initialization
initializeDatabase();