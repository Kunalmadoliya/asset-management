import "dotenv/config";
import {createApp} from "./app.js";

async function start() {
  try {
    const port = process.env.PORT;
    const app = createApp()
    
    app.get("/", (req, res) => {
      res.send("Hello, World!");
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
