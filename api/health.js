module.exports = function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://fred-platform.vercel.app https://*.vercel.app"
  );
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  res.statusCode = 200;
  res.end(JSON.stringify({ status: "ok", app: "radar" }));
};
