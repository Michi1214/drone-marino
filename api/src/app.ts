import express from "express";
import dotenv from "dotenv";
import publicRoutes from "./routes/public";
import areaRoutes from "./routes/areas";
import requestRoutes from "./routes/requests";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

dotenv.config();

const app = express();
app.use(express.json());

// 🔎 logger PRIMA delle route (così logga tutto, anche /healthz)
app.use(requestLogger);

// health
app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok" }));

// routes
app.use(publicRoutes);
app.use(requestRoutes);
app.use(areaRoutes);

// ❗️ error handler SEMPRE per ultimo
app.use(errorHandler);

export default app;
