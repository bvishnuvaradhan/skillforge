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

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  let payload: ApiResponseEnvelope<T> | null = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      payload = (await response.json()) as ApiResponseEnvelope<T>;
    } catch {
      payload = null;
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
