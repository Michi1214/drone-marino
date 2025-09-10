require('dotenv').config();

const common = {
  username: process.env.DB_USER || process.env.POSTGRES_USER || 'drone',
  password: process.env.DB_PASS || process.env.POSTGRES_PASSWORD || 'dronepwd',
  database: process.env.DB_NAME || process.env.POSTGRES_DB || 'dronedb',
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || process.env.POSTGRES_PORT || 5432),
  dialect: 'postgres',
  logging: false,
  timezone: '+00:00'
};

module.exports = {
  development: common,
  test: common,
  production: common
};