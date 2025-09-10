import { Sequelize } from "sequelize";
const DB_NAME = process.env.DB_NAME || process.env.POSTGRES_DB || "dronedb";
const DB_USER = process.env.DB_USER || process.env.POSTGRES_USER || "drone";
const DB_PASS = process.env.DB_PASS || process.env.POSTGRES_PASSWORD || "dronepwd";
const DB_HOST = process.env.DB_HOST || "db";
const DB_PORT = Number(process.env.DB_PORT || process.env.POSTGRES_PORT || 5432);

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: false,
  timezone: "+00:00"
});
