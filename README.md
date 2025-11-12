KollegeApply — Backend README

This README explains how to run the backend server and lists the backend API endpoints. It's written in simple, easy-to-understand language for beginners.

## Quick start (backend)

1. Open PowerShell and go to the backend folder:

```powershell
Set-Location api-backend
```

2. Install dependencies:

```powershell
npm install
```

3. Make sure you have a `.env` file at the project root (one level above `api-backend`). You can copy the example:

```powershell
cp ..\.env.example ..\.env
# Edit ..\.env and set PIPEDREAM_ENDPOINT_API to your endpoint
```

4. Start the server:

```powershell
npm start
# or use nodemon if you prefer: nodemon server.js
```

The server runs on port 3000 by default. Visit `http://localhost:3000/health` to check it is running.

## Backend API endpoints
All examples below assume the server runs at `http://localhost:3000`.

- GET /health
	- Purpose: quick server health check
	- Example: `curl http://localhost:3000/health`
	- Response: `{ "status": "ok", "timestamp": 1234567890 }`

- GET /api/config
	- Purpose: returns configured server settings (currently the Pipedream endpoint)
	- Example: `curl http://localhost:3000/api/config`
	- Response: `{ "pipedreamEndpoint": "https://..." }`

- GET /api/universities
	- Purpose: returns the `universities.json` content
	- Example: `curl http://localhost:3000/api/universities`

- GET /api/fees/:university
	- Purpose: returns fees for a supported university (use `amity` or `lpu`)
	- Example: `curl http://localhost:3000/api/fees/amity`
	- Error: If the university is not found you get a 404 and `{ "error": "University not found" }`

## Environment
- `PIPEDREAM_ENDPOINT_API` — Pipedream webhook endpoint used by the frontends. Put it in the `.env` file in the project root.
- `PORT` — optional, default is 3000

## Files to look at
- `api-backend/server.js` — the backend server source
- `api-backend/fees.amity.json` and `api-backend/fees.lpu.json` — fee data
- `amity-landing/` and `lpu-landing/` — front-end landing pages

## Troubleshooting
- If you change `.env`, restart the server.
- If the server logs `Warning: PIPEDREAM_ENDPOINT_API not configured`, check your `.env` path and the value.
- For 404s on fees, send the exact key `amity` or `lpu`.

If you want this README even simpler or want me to add copy/paste curl examples for each endpoint response, tell me and I'll update it.
