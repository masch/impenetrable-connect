import { Context, Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { sql } from "drizzle-orm";
import { logger } from "../services/logger.service";
import type { GitHubRun } from "@repo/shared";
import { getAppConfig, type AppEnv } from "../config/env";

const health = new Hono<AppEnv>();

/**
 * Helper to check if the request is authorized via health token.
 */
const checkAuth = (c: Context<AppEnv>) => {
  const config = getAppConfig(c);
  const healthKey = c.req.header("X-Health-Key");
  return !!(healthKey && healthKey === config.healthToken);
};

health.get("/", async (c) => {
  const config = getAppConfig(c);
  const isAuthorized = checkAuth(c);

  // Minimal response for public access
  if (!isAuthorized) {
    return c.json({ status: "ok" });
  }

  // Detailed response for authorized access
  const start = Date.now();
  let dbStatus: "ok" | "error" = "ok";
  let dbLatency: number | null = null;
  const db = c.var.db;

  try {
    await db.execute(sql`SELECT 1`);
    dbLatency = Date.now() - start;
  } catch (error) {
    logger.error("Database health check failed", error);
    dbStatus = "error";
  }

  let githubRuns: GitHubRun[] = [];
  const GITHUB_REPO = config.githubRepo;
  const GITHUB_TOKEN = config.githubToken;

  if (GITHUB_REPO) {
    try {
      const ghUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=5`;
      const response = await fetch(ghUrl, {
        headers: {
          "User-Agent": "Hono-Backend",
          ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
        },
      });
      if (response.ok) {
        const data = (await response.json()) as { workflow_runs?: GitHubRun[] };
        githubRuns = (data.workflow_runs || []).slice(0, 3);
      }
    } catch (error) {
      logger.error("GitHub fetch failed in health check", error);
    }
  }

  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      latency: dbLatency ? `${dbLatency}ms` : null,
    },
    github: GITHUB_REPO
      ? {
          repo: GITHUB_REPO,
          runs: githubRuns,
        }
      : undefined,
  });
});

health.get("/check-runs/:ref", async (c) => {
  if (!checkAuth(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const config = getAppConfig(c);

  const ref = c.req.param("ref");
  const GITHUB_REPO = config.githubRepo;
  const GITHUB_TOKEN = config.githubToken;

  if (!ref || !GITHUB_REPO) {
    return c.json({ error: "Missing parameters" }, 400);
  }

  try {
    // 1. Fetch check runs
    const ghUrl = `https://api.github.com/repos/${GITHUB_REPO}/commits/${ref}/check-runs`;
    const response = await fetch(ghUrl, {
      headers: {
        "User-Agent": "Hono-Backend",
        ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
      },
    });

    if (!response.ok) {
      return c.json({ error: "GitHub API error" }, response.status as ContentfulStatusCode);
    }

    const data = (await response.json()) as {
      check_runs: { name: string; output?: { annotations_url: string } }[];
    };
    const checkRuns = data.check_runs || [];

    // 2. Fetch annotations for first check run if exists
    let messages: string[] = [];
    let annotationsCount = 0;

    if (checkRuns.length > 0 && checkRuns[0].output?.annotations_url) {
      const annRes = await fetch(checkRuns[0].output.annotations_url, {
        headers: {
          "User-Agent": "Hono-Backend",
          ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
        },
      });
      if (annRes.ok) {
        const annotations = (await annRes.json()) as { message: string }[];
        annotationsCount = annotations.length;
        messages = annotations.map((a) => `[${checkRuns[0].name}] ${a.message}`);
      }
    }

    return c.json({
      check_runs_count: checkRuns.length,
      annotations_count: annotationsCount,
      messages,
    });
  } catch (error) {
    logger.error("GitHub proxy fetch failed", error);
    return c.json({ error: "Internal Error" }, 500);
  }
});

export { health as healthRouter };
