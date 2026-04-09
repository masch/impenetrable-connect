import { UserRole, USER_ROLE_KEYS } from "@repo/shared";

interface RoleConfig {
  labelKey: string;
  descriptionKey: string;
  landingPage: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  TOURIST: {
    ...USER_ROLE_KEYS.TOURIST,
    landingPage: "/tourist/login",
  },
  ENTREPRENEUR: {
    ...USER_ROLE_KEYS.ENTREPRENEUR,
    landingPage: "/entrepreneur/request",
  },
  ADMIN: {
    ...USER_ROLE_KEYS.ADMIN,
    landingPage: "/admin/project",
  },
};

export const ROLES = Object.entries(ROLE_CONFIG).map(([role, config]) => ({
  role: role as UserRole,
  ...config,
}));
