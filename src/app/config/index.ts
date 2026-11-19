import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });

/** Required variables stop the server at startup with a clear message. */
const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name} (see .env.example)`);
  }
  return value;
};

/** Optional variables fall back to a default (empty string disables the feature). */
const optional = (name: string, fallback = ""): string => process.env[name] || fallback;

export const config = {
  frontend_url: optional("FRONTEND_URL", "http://localhost:3000"),
  backend_url: optional("BACKEND_URL", "http://localhost:5000"),
  port: optional("PORT", "5000"),
  node_env: optional("NODE_ENV", "development"),
  database_url: required("DATABASE_URL"),
  bcrypt_salt_rounds: optional("BCRYPT_SALT_ROUNDS", "12"),
  jwt_access_secret: required("JWT_ACCESS_SECRET"),
  jwt_refresh_secret: required("JWT_REFRESH_SECRET"),
  jwt_access_expires_in: optional("JWT_ACCESS_EXPIRES_IN", "1d"),
  jwt_refresh_expires_in: optional("JWT_REFRESH_EXPIRES_IN", "7d"),
  redis_host: optional("REDIS_HOST", "127.0.0.1"),
  redis_port: optional("REDIS_PORT", "6379"),
  redis_password: optional("REDIS_PASSWORD"),
  redis_user: optional("REDIS_USER"),
  smtp_user: optional("SMTP_USER"),
  smtp_password: optional("SMTP_PASSWORD"),
  cloudinary_cloud_name: optional("CLOUDINARY_CLOUD_NAME"),
  cloudinary_api_key: optional("CLOUDINARY_API_KEY"),
  cloudinary_api_secret: optional("CLOUDINARY_API_SECRET"),
  google_client_id: optional("GOOGLE_CLIENT_ID"),

  bkash_base_url: optional("BKASH_BASE_URL", "https://tokenized.sandbox.bka.sh/v1.2.0-beta"),
  bkash_app_key: optional("BKASH_APP_KEY"),
  bkash_app_secret: optional("BKASH_APP_SECRET"),
  bkash_username: optional("BKASH_USERNAME"),
  bkash_password: optional("BKASH_PASSWORD"),
  bkash_callback_url: optional("BKASH_CALLBACK_URL", "http://localhost:5000/api/v1"),

  // ============================================
  // Demo accounts (one per role)
  // ============================================

  demo_admin_name: optional("DEMO_ADMIN_NAME"),
  demo_admin_email: optional("DEMO_ADMIN_EMAIL"),
  demo_admin_password: optional("DEMO_ADMIN_PASSWORD"),

  demo_agent_name: optional("DEMO_AGENT_NAME"),
  demo_agent_email: optional("DEMO_AGENT_EMAIL"),
  demo_agent_password: optional("DEMO_AGENT_PASSWORD"),

  demo_user_name: optional("DEMO_USER_NAME"),
  demo_user_email: optional("DEMO_USER_EMAIL"),
  demo_user_password: optional("DEMO_USER_PASSWORD"),
};

export const isProduction = config.node_env === "production";
