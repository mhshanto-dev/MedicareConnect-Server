import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017/medicare"
);

export const auth = betterAuth({
  database: mongoClient.db(),
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-change-in-production",
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: (process.env.BETTER_AUTH_URL || "http://localhost:5000") + "/api/auth/callback/google",
    },
  },
  trustedOrigins: [
    process.env.CLIENT_URL || "http://localhost:3000",
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
});
