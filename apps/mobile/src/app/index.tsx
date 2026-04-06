import { Redirect } from "expo-router";
import { useAuthStore } from "../stores/auth.store";

const roleLandingPages = {
  TOURIST: "/tourist/catalog",
  ENTREPRENEUR: "/entrepreneur/request",
  ADMIN: "/admin/project",
} as const;

export default function Index() {
  const { userRole } = useAuthStore();
  const landingPage = roleLandingPages[userRole] ?? "/tourist/catalog";
  return <Redirect href={landingPage} />;
}
