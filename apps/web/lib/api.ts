import { env } from "../env";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; meta?: Record<string, unknown> }> {
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (!cleanEndpoint.startsWith("/v1/")) {
    cleanEndpoint = `/v1${cleanEndpoint}`;
  }
  const baseUrl = env.NEXT_PUBLIC_API_URL.endsWith("/")
    ? env.NEXT_PUBLIC_API_URL.slice(0, -1)
    : env.NEXT_PUBLIC_API_URL;

  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  let payload: ApiResponseEnvelope<T> | null = null;
  const parsePayload = async (res: Response) => {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        return (await res.json()) as ApiResponseEnvelope<T>;
      } catch {
        return null;
      }
    }
    return null;
  };

  payload = await parsePayload(response);

  // Auto-refresh token if we hit a 401 Unauthorized, and this is not an auth endpoint
  const isAuthRequest =
    cleanEndpoint.startsWith("/v1/auth/login") ||
    cleanEndpoint.startsWith("/v1/auth/register") ||
    cleanEndpoint.startsWith("/v1/auth/refresh");

  if (response.status === 401 && !isAuthRequest) {
    try {
      const refreshUrl = `${baseUrl}/v1/auth/refresh`;
      const refreshRes = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (refreshRes.ok) {
        // Retry the original request with the new session cookies
        response = await fetch(url, {
          credentials: "include",
          ...options,
          headers,
        });
        payload = await parsePayload(response);
      }
    } catch (refreshErr) {
      console.error("Silent refresh failed in apiFetch:", refreshErr);
    }
  }

  if (!response.ok) {
    const errorData = payload?.error || {};
    throw new ApiError(
      response.status,
      errorData.code || "HTTP_ERROR",
      errorData.message || `Request failed with status ${response.status}`,
      errorData.details || {}
    );
  }

  // Fallback if payload is empty but response is 2xx
  if (!payload) {
    return { success: true, data: {} as T };
  }

  return {
    success: payload.success,
    data: payload.data,
    meta: payload.meta,
  };
}
