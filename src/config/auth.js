import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    dialect: "mongodb",
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/medicare"
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "mock_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_secret",
    }
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
});
