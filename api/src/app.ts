import express from "express";
import dotenv from "dotenv";

dotenv.config(); // legge valori da env (in Docker passati via compose)

const app = express();

// Middleware base
app.use(express.json());

// Healthcheck
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Rotta pubblica placeholder per aree vietate
app.get("/v1/areas/public", (_req, res) => {
  res.json({
    items: [],
    note: "Placeholder - qui ritorneremo le aree vietate dal DB"
  });
});

export default app;
