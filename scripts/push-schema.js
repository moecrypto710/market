// Simple script to push schema to the database
const { execSync } = require('child_process');
const path = require('path');

console.log('Creating database tables...');

try {
  // Install drizzle-kit if needed
  execSync('npm install -g drizzle-kit', { stdio: 'inherit' });
  
  // Push schema to database
  execSync('npx drizzle-kit push:pg', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL
    }
  });
  
  console.log('Database schema pushed successfully');
} catch (error) {
  console.error('Error pushing schema:', error);
  process.exit(1);
}