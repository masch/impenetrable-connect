import { Hono } from "hono";
import { healthRouter } from "./routes/health";
import { requestLogger } from "./middleware/logger";

const app = new Hono();

app.use("*", requestLogger({ logBody: process.env.LOG_BODY === "true" }));

app.route("/health", healthRouter);

export default app;
