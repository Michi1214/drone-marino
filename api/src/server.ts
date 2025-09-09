import app from "./app";

const port = Number(process.env.API_PORT || 3000);

app.listen(port, () => {
  console.log(`[api] listening on http://0.0.0.0:${port}`);
});
