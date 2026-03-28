import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import apiRoutes from "./routes/api.routes.js";
import { requestLogger } from "./middleware/request-logger.js";
import { notFoundHandler, errorHandler } from "./middleware/error-handler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const publicDir = path.join(__dirname, "../../public");

app.use(express.json());
app.use(requestLogger);
app.use(express.static(publicDir));

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;