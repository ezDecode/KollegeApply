const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const app = express();
const jsonCache = new Map();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
	const start = Date.now();
	res.on('finish', () => console.log(`${req.method} ${req.path} - ${res.statusCode} (${Date.now() - start}ms)`));
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-Frame-Options', 'DENY');
	res.setHeader('X-XSS-Protection', '1; mode=block');
	next();
});

async function readJson(filename) {
	const filePath = path.join(__dirname, filename);
	if (jsonCache.has(filePath)) return jsonCache.get(filePath);
	const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
	jsonCache.set(filePath, data);
	return data;
}
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get("/", (req, res) => {
	res.setHeader('Cache-Control', 'public, max-age=3600');
	res.json({ message: "KollegeApply API", version: "1.0.0", endpoints: { health: "/health", config: "/api/config", universities: "/api/universities", fees: "/api/fees/:university" } });
});
app.get("/health", (req, res) => {
	res.setHeader('Cache-Control', 'no-cache');
	res.json({ status: "ok", timestamp: Date.now() });
});
app.get("/api/config", (req, res) => {
	res.setHeader('Cache-Control', 'private, max-age=300');
	res.json({ pipedreamEndpoint: process.env.PIPEDREAM_ENDPOINT_API || null, backendUrl: process.env.BACKEND_URL || null, lpuLanding: process.env.LPU_LANDING_URL || null, amityLanding: process.env.AMITY_LANDING_URL || null });
});
app.get("/api/universities", asyncHandler(async (req, res) => {
	res.setHeader('Cache-Control', 'public, max-age=1800');
	res.json(await readJson("universities.json"));
}));

const feeFileMap = Object.freeze({ lpu: "fees.lpu.json", amity: "fees.amity.json" });
app.get("/api/fees/:university", asyncHandler(async (req, res) => {
	const uniKey = (req.params.university || "").toLowerCase().trim();
	if (!uniKey) return res.status(400).json({ error: "University parameter is required", allowed: Object.keys(feeFileMap) });
	const filename = feeFileMap[uniKey];
	if (!filename) return res.status(404).json({ error: "University not found", allowed: Object.keys(feeFileMap) });
	res.setHeader('Cache-Control', 'public, max-age=1800');
	res.json(await readJson(filename));
}));

app.use((req, res) => res.status(404).json({ error: "Route not found", path: req.path, method: req.method }));
app.use((err, req, res, next) => {
	console.error('Error:', req.method, req.path, err.message);
	if (err.stack) console.error(err.stack);
	if (res.headersSent) return next(err);
	const status = err.statusCode || (err.code === "ENOENT" ? 404 : 500);
	res.status(status).json({ error: status === 404 ? "Resource not found" : "Internal server error", ...(process.env.NODE_ENV === 'development' && { details: err.message }) });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✓ API running on http://localhost:${port}\n✓ Env: ${process.env.NODE_ENV || 'development'}\n✓ Endpoints: /health, /api/config, /api/universities, /api/fees/:university`));
