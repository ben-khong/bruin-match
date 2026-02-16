const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'ben',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'bruin_match',
  password: process.env.PGPASSWORD || '',
  port: Number(process.env.PGPORT) || 5432,
});

module.exports = pool;