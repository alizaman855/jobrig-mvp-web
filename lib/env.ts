import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = z.treeifyError(parsed.error);
    console.error(
      "\n❌ Invalid or missing environment variables:\n",
      JSON.stringify(issues.properties, null, 2),
      "\nCheck .env.local against .env.example.\n"
    );
    throw new Error("Invalid environment variables. See errors above.");
  }

  return parsed.data;
}

export const env = loadEnv();
