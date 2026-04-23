import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { openURL } from "expo-linking";
import { Stack, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../hooks/useI18n";
import { StatusService, BackendHealthWithLatency } from "../services/status.service";
import { logger } from "../services/logger.service";
import Screen, { ScreenContent } from "../components/Screen";
import LoadingView from "../components/LoadingView";
import { Button } from "../components/Button";
import { formatTime } from "../logic/formatters";
import { GitHubRun, COLORS } from "@repo/shared";

interface StatusCardProps {
  title: string;
  status: "success" | "warning" | "error" | "in_progress" | "loading";
  description?: string;
  badgeStyle?: { text: string; bg: string; border: string };
  detail?: string;
  url?: string;
  messages?: string[];
  isDetailed?: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

function StatusIndicator({ status }: { status: StatusCardProps["status"] }) {
  const colors = {
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    in_progress: "bg-tertiary",
    loading: "bg-outline-variant",
  };

  return <View className={`w-3 h-3 rounded-full ${colors[status]}`} />;
}

function StatusCard({
  title,
  status,
  description,
  badgeStyle,
  detail,
  url,
  icon,
  messages,
  isDetailed,
}: StatusCardProps) {
  const { t } = useTranslations();

  const handlePress = () => {
    if (url) {
      openURL(url);
    }
  };

  const statusLabel = {
    success: t("status.operational"),
    warning: t("status.degraded"),
    error: t("status.outage"),
    in_progress: t("status.loading_dots"),
    loading: t("status.loading_dots"),
  }[status];

  const titleColors = {
    success: "text-on-surface",
    warning: "text-warning",
    error: "text-error",
    in_progress: "text-tertiary",
    loading: "text-on-surface/60",
  }[status];

  const content = (
    <View className="p-4 flex-row items-start gap-4 w-full">
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mt-1">
        <MaterialCommunityIcons name={icon} size={24} color={COLORS.primary} />
      </View>
      <View className="flex-1 items-start">
        <View className="flex-row items-center justify-between w-full pr-2">
          <View className="flex-row items-center gap-2">
            <Text
              testID="status-title"
              accessibilityLabel={title}
              className={`text-lg font-bold ${titleColors}`}
            >
              {title}
            </Text>
            {url && <MaterialCommunityIcons name="open-in-new" size={14} color="gray" />}
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-medium text-on-surface/80">{statusLabel}</Text>
            <StatusIndicator status={status} />
          </View>
        </View>

        <View
          className={`mt-2 self-start px-2 py-1 rounded-md ${badgeStyle?.bg || "bg-on-surface/5"} border ${badgeStyle?.border || "border-on-surface/10"} flex-row items-center gap-1`}
        >
          {(status === "error" || badgeStyle?.text === "text-error") && (
            <MaterialCommunityIcons name="alert" size={10} color={COLORS.error} />
          )}
          <Text
            className={`font-bold tracking-wider ${badgeStyle?.text || "text-on-surface/60"} text-[10px] uppercase`}
          >
            {description}
          </Text>
        </View>

        {detail && <Text className="mt-2 text-sm text-on-surface/40 font-medium">{detail}</Text>}

        {isDetailed && messages && messages.length > 0 && (
          <View className="mt-3 pt-3 border-t border-on-surface/5 w-full">
            {messages.map((msg, idx) => (
              <View key={idx} className="flex-row items-start gap-2 mb-1">
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={12}
                  color={COLORS.warning}
                  className="mt-0.5"
                />
                <Text className="text-[11px] text-warning/80 font-medium leading-tight flex-1">
                  {msg}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  if (url) {
    return (
      <Button
        variant="ghost"
        onPress={handlePress}
        className="mb-4 overflow-hidden rounded-2xl border border-white/20 bg-surface/60 backdrop-blur-md w-full p-0 flex-col items-stretch justify-start min-h-0"
      >
        {content}
      </Button>
    );
  }

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-white/20 bg-surface/60 backdrop-blur-md w-full">
      {content}
    </View>
  );
}

export default function StatusScreen() {
  const { t } = useTranslations();
  const isDetailed = useLocalSearchParams<{ debug: string }>().debug === "true";

  const [health, setHealth] = useState<BackendHealthWithLatency | null>(null);
  const [runs, setRuns] = useState<GitHubRun[] | null>(null);
  const [annotations, setAnnotations] = useState<
    Record<string, { count: number; messages: string[] }>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setFetchError(null);

    // We fetch independently so GitHub failures don't block the backend status
    const [healthData, runsData] = await Promise.all([
      StatusService.fetchBackendHealth().catch((err) => {
        logger.error("[ERROR] Backend health fetch failed", err);
        setFetchError("unreachable");
        return null;
      }),
      StatusService.fetchGitHubRuns().catch((err) => {
        logger.error("[ERROR] GitHub runs fetch failed", err);
        return null; // Return null on failure instead of empty array
      }),
    ]);

    if (runsData && runsData.length > 0 && isDetailed) {
      const relevantRuns = runsData.slice(0, 3);
      const annotationsMap: Record<string, { count: number; messages: string[] }> = {};

      await Promise.all(
        relevantRuns.map(async (run) => {
          try {
            const data = await StatusService.fetchCheckRuns(run.head_commit.id);
            annotationsMap[run.head_commit.id] = {
              count: data.annotations_count,
              messages: data.messages,
            };
          } catch (e) {
            logger.error(`Failed to fetch annotations for run ${run.id}`, e);
          }
        }),
      );
      setAnnotations(annotationsMap);
    }

    if (healthData) setHealth(healthData);
    if (runsData) setRuns(runsData);

    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, [isDetailed]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return <LoadingView message={t("loading")} />;
  }

  const getStatusFromRuns = (runs: GitHubRun[] | null, name: string) => {
    if (runs === null) return { status: "error" as const, message: t("status.unreachable") };

    const run = runs.find((r) => r.name.toLowerCase().includes(name.toLowerCase()));
    if (!run) return { status: "loading" as const, message: t("status.loading_dots") };

    const annotationData = annotations[run.head_commit.id];
    const annotationCount = annotationData?.count || 0;
    const forcedWarning = isDetailed && annotationCount > 0 && run.conclusion === "success";

    const statusMap = {
      completed:
        run.conclusion === "success" && !forcedWarning
          ? ("success" as const)
          : run.conclusion === "failure"
            ? ("error" as const)
            : ("warning" as const),
      in_progress: "in_progress" as const,
      queued: "loading" as const,
    };

    const shortHash = run.head_commit.id.substring(0, 7);
    const timeAgo = formatTime(run.created_at);

    return {
      status: statusMap[run.status as keyof typeof statusMap] || ("error" as const),
      message: run.head_commit.message,
      detail: `${shortHash} • ${timeAgo}${forcedWarning ? ` • ${annotationCount} warnings` : ""}`,
      url: run.html_url,
      messages: annotationData?.messages || [],
    };
  };

  const ciStatus = getStatusFromRuns(runs, "CI");
  const deployStatus = getStatusFromRuns(runs, "Deploy Web");

  const dbLatencyNum = health?.database.latency ? parseInt(health.database.latency) : 0;
  const dbStatus =
    health?.database.status === "error" ? "error" : dbLatencyNum > 500 ? "warning" : "success";

  const uptimeHours = Math.floor((health?.uptime || 0) / 3600);
  const uptimeMinutes = Math.floor(((health?.uptime || 0) % 3600) / 60);
  const uptimeStr = `${uptimeHours}h ${uptimeMinutes}m`;

  const envColors = {
    production: { text: "text-error", bg: "bg-error/10", border: "border-error/20" },
    staging: { text: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
    development: { text: "text-tertiary", bg: "bg-tertiary/10", border: "border-tertiary/20" },
    mock: { text: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20" },
    default: { text: "text-on-surface/60", bg: "bg-on-surface/5", border: "border-on-surface/10" },
  };

  const env = health?.environment && health.environment !== "mock" ? health.environment : "default";
  const colors = envColors[env as keyof typeof envColors] || envColors.default;

  const apiDesc =
    health?.environment && health.environment !== "mock"
      ? `${t("status.env_label")}: ${t(`status.env_${health.environment}`)}`
      : t("status.api_desc");

  const dbDesc =
    health?.environment && health.environment !== "mock"
      ? `${t("status.env_label")}: ${t(`status.env_${health.environment}`)}`
      : t("status.db_desc");

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: t("status.title"),
          headerTransparent: true,
          headerBlurEffect: "dark",
        }}
      />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        <ScreenContent className="pt-24 px-4 items-start">
          <View className="mb-8 items-start w-full">
            <Text className="text-3xl font-bold text-on-surface mb-2">{t("status.title")}</Text>
            {fetchError && (
              <View className="bg-error/10 p-3 rounded-lg border border-error/20 mb-4">
                <Text className="text-error text-sm font-medium">{t(`status.${fetchError}`)}</Text>
              </View>
            )}
            {lastUpdated && !fetchError && (
              <Text className="text-on-surface/50">
                {t("status.last_updated", { time: formatTime(lastUpdated) })}
              </Text>
            )}
          </View>

          <View className="mb-8 items-start w-full">
            <Text className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
              {t("status.services")}
            </Text>
            <StatusCard
              title={t("status.api")}
              icon="server"
              status={health?.status === "ok" ? "success" : "error"}
              description={health?.status === "ok" ? apiDesc : t("status.unreachable")}
              badgeStyle={colors}
              detail={`${t("status.latency_label", { value: health?.apiLatency || "0ms" })} • ${t("status.uptime_label", { value: uptimeStr })}`}
            />
            <StatusCard
              title={t("status.database")}
              icon="database"
              status={dbStatus}
              description={health?.database.status === "ok" ? dbDesc : t("status.outage")}
              badgeStyle={colors}
              detail={t("status.latency_label", { value: health?.database.latency || "0ms" })}
            />
          </View>

          <View className="mb-8 items-start w-full">
            <Text className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
              {t("status.pipelines")}
            </Text>
            <StatusCard
              title={t("status.ci")}
              icon="github"
              status={ciStatus.status}
              description={ciStatus.message}
              badgeStyle={
                ciStatus.status === "error"
                  ? envColors.production
                  : ciStatus.status === "warning" || ciStatus.status === "in_progress"
                    ? envColors.staging
                    : undefined
              }
              detail={ciStatus.detail || "GitHub Actions"}
              url={ciStatus.url}
              messages={ciStatus.messages}
              isDetailed={isDetailed}
            />
            <StatusCard
              title={t("status.deploy")}
              icon="rocket-launch"
              status={deployStatus.status}
              description={deployStatus.message}
              badgeStyle={
                deployStatus.status === "error"
                  ? envColors.production
                  : deployStatus.status === "warning" || deployStatus.status === "in_progress"
                    ? envColors.staging
                    : undefined
              }
              detail={deployStatus.detail || "EAS Hosting"}
              url={deployStatus.url}
              messages={deployStatus.messages}
              isDetailed={isDetailed}
            />
          </View>

          <View className="w-full items-center mb-10">
            <Button
              variant="outline"
              title={t("status.refresh")}
              leftIcon="refresh"
              onPress={onRefresh}
              className="px-8"
            />
          </View>
        </ScreenContent>
      </ScrollView>
    </Screen>
  );
}
