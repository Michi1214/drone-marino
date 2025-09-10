import app from "./app";
import { sequelize } from "./config/db";

const port = Number(process.env.API_PORT || 3000);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("[db] connected");
    app.listen(port, () => console.log(`[api] listening on http://0.0.0.0:${port}`));
  } catch (e) {
    console.error("[db] connection error:", e);
    process.exit(1);
  }
})();
