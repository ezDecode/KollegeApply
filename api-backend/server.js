const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");

const app = express();
app.use(cors());
app.use(express.json());

const jsonCache = new Map();

async function readJson(filename) {
	const filePath = path.join(__dirname, filename);
	if (jsonCache.has(filePath)) {
		return jsonCache.get(filePath);
	}
	const raw = await fs.readFile(filePath, "utf-8");
	const parsed = JSON.parse(raw);
	jsonCache.set(filePath, parsed);
	return parsed;
}

function asyncHandler(handler) {
	return (req, res, next) => {
		Promise.resolve(handler(req, res, next)).catch(next);
	};
}

app.get("/", (req, res) => {
	res.json({ 
		message: "KollegeApply API",
		version: "1.0.0",
		endpoints: {
			health: "/health",
			config: "/api/config",
			universities: "/api/universities",
			fees: "/api/fees/:university"
		}
	});
});

app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/api/config", (req, res) => {
	res.json({ 
		pipedreamEndpoint: process.env.PIPEDREAM_ENDPOINT_API || null,
		backendUrl: process.env.BACKEND_URL || null,
		lpuLanding: process.env.LPU_LANDING_URL || null,
		amityLanding: process.env.AMITY_LANDING_URL || null
    });
});

app.get("/api/universities", asyncHandler(async (req, res) => {
	const data = await readJson("universities.json");
	res.json(data);
}));

const feeFileMap = Object.freeze({
	lpu: "fees.lpu.json",
	amity: "fees.amity.json"
});

app.get("/api/fees/:university", asyncHandler(async (req, res) => {
	const uniKey = (req.params.university || "").toLowerCase();
	const filename = feeFileMap[uniKey];
	if (!filename) {
		return res.status(404).json({ error: "University not found" });
	}
	const data = await readJson(filename);
	res.json(data);
}));

app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
	console.error("Error:", err);
	if (res.headersSent) {
		return next(err);
	}
	const status = err.code === "ENOENT" ? 404 : 500;
	const message = status === 404 ? "Resource not found" : "Internal server error";
	res.status(status).json({ error: message });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`API listening on http://localhost:${port}`);
});
