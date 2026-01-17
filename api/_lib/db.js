const { Pool } = require('pg');

// Create connection pool optimized for serverless
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false },
    // Serverless optimization
    max: 1, // Limit connections per function
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Handle errors
pool.on('error', (err) => {
    console.error('Unexpected pool error:', err);
});

module.exports = pool;
