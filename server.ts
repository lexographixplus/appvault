import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "AppVault", timestamp: new Date().toISOString() });
  });

  // Google Sheets Backend Proxy.
  // Only Apps Script endpoints are forwardable — an unrestricted targetUrl would
  // turn this route into an open proxy into the host's network.
  const ALLOWED_PROXY_HOSTS = ["script.google.com", "script.googleusercontent.com"];

  app.post("/api/sheets/proxy", async (req, res) => {
    const { targetUrl, method, body } = req.body;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing targetUrl parameter" });
    }

    let parsedTarget: URL;
    try {
      parsedTarget = new URL(targetUrl);
    } catch {
      return res.status(400).json({ error: "targetUrl is not a valid URL" });
    }

    if (parsedTarget.protocol !== "https:" || !ALLOWED_PROXY_HOSTS.includes(parsedTarget.hostname)) {
      return res.status(403).json({
        error: `targetUrl host not allowed. Permitted hosts: ${ALLOWED_PROXY_HOSTS.join(", ")}`,
      });
    }

    try {
      const options: RequestInit = {
        method: method || "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      };

      if (body) {
        options.body = typeof body === "string" ? body : JSON.stringify(body);
      }

      const response = await fetch(parsedTarget.href, options);
      const text = await response.text();

      try {
        const json = JSON.parse(text);
        return res.json(json);
      } catch {
        return res.send(text);
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to proxy request to Google Sheets" });
    }
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AppVault server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start AppVault server:", err);
  process.exit(1);
});
