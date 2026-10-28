import "dotenv/config";
import {createApp} from "./app.js";

async function start() {
  try {
    const port = process.env.PORT;
    const app = createApp();

    app.get("/", (req, res) => {
      res.send("Hello, World!");
    });

    app.get("/api/health", (req, res) => {
      res.json({status: "ok"});
    });

    // Protected /api/me route example
    app.get("/api/me", requireAuth, (req, res) => {
      res.json({
        user: req.user,
        session: req.session,
      });
    });

    app.listen(port, () => {
      console.log(`Server running on port http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
