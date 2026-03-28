import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`OmniCalc server started on http://localhost:${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
});