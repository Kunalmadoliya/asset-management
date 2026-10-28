import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { requireAuth } from "./features/auth/auth.middleware.js";

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

export function createApp() {
  const app = express();

  // Enable CORS with credentials for frontend
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  // Better Auth handler MUST be mounted BEFORE express.json()
  // Express 5 wildcard parameter uses "*splat"
  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json());

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Protected /api/me route example
  app.get("/api/me", requireAuth, (req, res) => {
    res.json({
      user: req.user,
      session: req.session,
    });
  });

  return app;
}
