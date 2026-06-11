import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_API_URL must not be empty")
    .default("http://localhost:3001"),
  NEXT_PUBLIC_SOCKET_URL: z
    .string()
    .optional()
    .default("http://localhost:3001"),
});

const result = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
});

if (!result.success) {
  console.warn(
    "[env] Environment variable validation failed — using fallback defaults for build:",
    result.error.format()
  );
}

export const env = result.success
  ? result.data
  : { NEXT_PUBLIC_API_URL: "http://localhost:3001", NEXT_PUBLIC_SOCKET_URL: "http://localhost:3001" };
