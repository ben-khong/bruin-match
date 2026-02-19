require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'leo22',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'bruin_match',
  password: process.env.PGPASSWORD || null,
  port: Number(process.env.PGPORT) || 5432,
});

module.exports = pool;