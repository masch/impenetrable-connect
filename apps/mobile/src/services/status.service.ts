import { BackendHealth, GitHubRun } from "@repo/shared";
import env from "../config/env";
import { logger } from "./logger.service";

const GITHUB_TOKEN = env.GITHUB_TOKEN;
const GITHUB_REPO = env.GITHUB_REPO;

export interface BackendHealthWithLatency extends BackendHealth {
  apiLatency: string;
}

interface StatusServiceInterface {
  fetchBackendHealth(): Promise<BackendHealthWithLatency>;
  fetchGitHubRuns(): Promise<GitHubRun[]>;
  fetchCheckRuns(ref: string): Promise<{ annotations_count: number; messages: string[] }>;
}

interface GitHubCheckRun {
  name?: string;
  output?: {
    title?: string;
    summary?: string;
    annotations_count: number;
    annotations_url?: string;
  };
}

const fetchGitHubRuns = async (): Promise<GitHubRun[]> => {
  const ghUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=10`;
  try {
    const response = await fetch(ghUrl, {
      headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : undefined,
    });
    if (!response.ok) throw new Error(`GH API failed: ${response.status}`);
    const data = await response.json();
    return data.workflow_runs as GitHubRun[];
  } catch (error) {
    logger.error("Failed to fetch GH runs", error);
    throw error;
  }
};

const fetchAnnotationsForRun = async (
  run: GitHubCheckRun,
  headers?: HeadersInit,
): Promise<{ fetched: boolean; messages: string[] }> => {
  const messages: string[] = [];
  if (!run.output?.annotations_url) return { fetched: false, messages };

  try {
    const annRes = await fetch(run.output.annotations_url, { headers });
    if (!annRes.ok) return { fetched: false, messages };

    const annotations = await annRes.json();
    if (!Array.isArray(annotations) || annotations.length === 0)
      return { fetched: false, messages };

    for (const a of annotations) {
      if (a.message) {
        messages.push(`[${run.name || "Check"}] ${a.message}`);
      }
    }
    return { fetched: true, messages };
  } catch (error) {
    logger.error("Failed to fetch annotations", error);
    return { fetched: false, messages };
  }
};

const fetchCheckRuns = async (
  ref: string,
): Promise<{ annotations_count: number; messages: string[] }> => {
  const ghUrl = `https://api.github.com/repos/${GITHUB_REPO}/commits/${ref}/check-runs`;
  try {
    const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : undefined;
    const response = await fetch(ghUrl, { headers });
    if (!response.ok) throw new Error(`GH API failed: ${response.status}`);
    const data = (await response.json()) as { check_runs: GitHubCheckRun[] };
    const annotations_count = data.check_runs.reduce(
      (acc: number, run: GitHubCheckRun) => acc + (run.output?.annotations_count || 0),
      0,
    );

    const filteredRuns = data.check_runs.filter(
      (run) => (run.output?.annotations_count || 0) > 0 || run.output?.summary || run.output?.title,
    );

    const messages: string[] = [];
    const seenMessages = new Set<string>();

    for (const run of filteredRuns) {
      const { fetched, messages: runMessages } = await fetchAnnotationsForRun(run, headers);

      if (fetched) {
        for (const msg of runMessages) {
          if (!seenMessages.has(msg)) {
            seenMessages.add(msg);
            messages.push(msg);
          }
        }
      } else {
        const fallbackMsg =
          run.output?.title || run.output?.summary || `${run.name || "Check"} produced warnings`;
        if (!seenMessages.has(fallbackMsg)) {
          seenMessages.add(fallbackMsg);
          messages.push(`[${run.name || "Check"}] ${fallbackMsg}`);
        }
      }
    }

    return { annotations_count, messages: messages.slice(0, 3) };
  } catch (error) {
    logger.error("Failed to fetch annotations", error);
    return { annotations_count: 0, messages: [] };
  }
};

/**
 * MOCK Implementation
 */
export const MockStatusService: StatusServiceInterface = {
  fetchBackendHealth: async () => {
    await new Promise((r) => setTimeout(r, 800));
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: 1296000,
      environment: "mock",
      database: { status: "ok", latency: "0ms" },
      apiLatency: "0ms",
    };
  },
  fetchGitHubRuns,
  fetchCheckRuns,
};

/**
 * REST API Implementation
 */
export const RestStatusService: StatusServiceInterface = {
  fetchBackendHealth: async () => {
    const healthUrl = env.API_URL.replace("/v1", "/health");
    const start = performance.now();
    try {
      const response = await fetch(healthUrl);
      const end = performance.now();
      const apiLatency = `${Math.round(end - start)}ms`;
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
      const data = await response.json();
      return { ...data, apiLatency };
    } catch (error) {
      logger.error("Health check failed", error);
      throw error;
    }
  },
  fetchGitHubRuns,
  fetchCheckRuns,
};

export const StatusService = env.USE_MOCKS ? MockStatusService : RestStatusService;
