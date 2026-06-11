export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  ONBOARDING: "/onboarding",
  AUTH_CALLBACK: "/auth/callback",
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];
