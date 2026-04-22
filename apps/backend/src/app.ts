import { Hono } from "hono";
import { healthRouter } from "./routes/health";
import { requestLogger } from "./middleware/logger";
import projectsRouter from "./routes/projects";
import { authRouter } from "./routes/auth";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.use("*", requestLogger({ logBody: process.env.LOG_BODY === "true" }));

app.route("/health", healthRouter);
app.route("/v1/projects", projectsRouter);
app.route("/v1/auth", authRouter);

export default app;
