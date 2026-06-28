// api/index.js — Vercel Serverless Entry Point
// ⚠️  Do NOT call app.listen() here. Vercel manages the HTTP server.
//     This file just exports the configured Express app.

import '../src/config/env.js';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Connect to MongoDB once per cold start (Vercel caches the module)
let isConnected = false;
const ensureDB = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Wrap the Express app so DB is connected before handling requests
const handler = async (req, res) => {
  await ensureDB();
  return app(req, res);
};

export default handler;
