const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = 3000;
const HOST = "127.0.0.1";
const ALLOWED_ORIGINS = new Set([
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-goog-api-key");
}

function requireAllowedOrigin(req, res, next) {
  const origin = req.headers.origin;
  applyCors(req, res);

  if (!origin) {
    next();
    return;
  }

  if (!ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({
      error: "Origin not allowed. This proxy only accepts localhost / 127.0.0.1 origins."
    });
    return;
  }

  next();
}

app.options("/gemini/v1beta/models/:model/generateContent", requireAllowedOrigin, (req, res) => {
  res.status(204).end();
});

app.use("/gemini/v1beta/models/:model/generateContent", requireAllowedOrigin, (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/gemini/v1beta/models/:model/generateContent", createProxyMiddleware({
  target: "https://generativelanguage.googleapis.com",
  changeOrigin: true,
  pathRewrite: {
    "^/gemini": ""
  },
  onProxyReq(proxyReq, req, res) {
    applyCors(req, res);
  },
  onError(error, req, res) {
    applyCors(req, res);
    res.status(502).json({
      error: "Gemini proxy request failed.",
      details: error.message
    });
  }
}));

app.use((req, res) => {
  res.status(404).json({
    error: "Not found. This local proxy only forwards /gemini/v1beta/models/:model/generateContent."
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Gemini proxy running on http://${HOST}:${PORT}`);
});
