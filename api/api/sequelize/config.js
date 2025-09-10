require('dotenv').config();

const username = process.env.DB_USER || process.env.POSTGRES_USER || 'drone';
const password = process.env.DB_PASS || process.env.POSTGRES_PASSWORD || 'dronepwd';
const database = process.env.DB_NAME || process.env.POSTGRES_DB || 'dronedb';
const host     = process.env.DB_HOST || 'db';
const port     = Number(process.env.DB_PORT || process.env.POSTGRES_PORT || 5432);

const base = {
  dialect: 'postgres',
  logging: false,
  timezone: '+00:00',
  migrationStorageTableName: 'sequelize_meta'
};

module.exports = {
  development: { ...base, username, password, database, host, port },
  test:        { ...base, username, password, database, host, port },
  production:  { ...base, username, password, database, host, port }
};
