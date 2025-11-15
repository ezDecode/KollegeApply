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

## Files to Check
- `api-backend/server.js` — the backend server source
- `api-backend/fees.amity.json` and `api-backend/fees.lpu.json` — fee data
- `amity-landing/` and `lpu-landing/` — front-end landing pages