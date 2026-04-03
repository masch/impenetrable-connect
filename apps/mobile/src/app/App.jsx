import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, ActivityIndicator, FlatList } from "react-native";
import { useProjectStore } from "../stores/project.store";
import { useI18n } from "../hooks/useI18n";

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    fontStyle: "italic",
  },
  error: {
    color: "red",
    marginTop: 20,
  },
  list: {
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  projectLang: {
    fontSize: 14,
    color: "#555",
  },
  projectStatus: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 6,
  },
  loading: {
    marginTop: 20,
  },
};

export default function App() {
  const { projects, isLoading, error, fetchProjects } = useProjectStore();
  const { t } = useI18n();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("app_title")}</Text>
      <Text style={styles.subtitle}>{t("mock_mode")}</Text>

      {isLoading && <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />}

      {error && (
        <Text style={styles.error}>
          {t("error")}: {error}
        </Text>
      )}

      {!isLoading && !error && (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.projectName}>{item.name}</Text>
              <Text style={styles.projectLang}>
                {t("default_language")}: {item.default_language.toUpperCase()}
              </Text>
              <Text style={styles.projectStatus}>
                {item.is_active ? `🟢 ${t("active")}` : `🔴 ${t("inactive")}`}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text>{t("no_projects")}</Text>}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}
