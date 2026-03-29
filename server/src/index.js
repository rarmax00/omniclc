import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { initDb } from "./services/db.service.js";

async function bootstrap() {
  await initDb();

  app.listen(env.port, () => {
    console.log(`OmniCalc server started on http://localhost:${env.port}`);
    console.log(`Environment: ${env.nodeEnv}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});