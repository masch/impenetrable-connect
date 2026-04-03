import { View, StyleSheet } from "react-native";
import { Link } from "expo-router";

const styles = StyleSheet.create({
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
});

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href="/projects">Projects</Link>
    </View>
  );
}
