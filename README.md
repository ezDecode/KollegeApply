KollegeApply — project scaffold

Structure created:

- package.json (root) — npm workspaces listing `amity-landing`, `lpu-landing`, `api-backend`
- .gitignore — ignores node_modules and common files
- api-backend/package.json — minimal scripts (start, dev)
- amity-landing/package.json — placeholder script to run a dev server
- lpu-landing/package.json — placeholder script to run a dev server

Notes:
- This is a file/folder scaffold only. No dependencies have been installed. Run `npm install` in the folders where you want packages installed.
- To install backend deps: `Set-Location api-backend; npm install express cors dotenv` and `npm install --save-dev nodemon`.
- To use the root workspace install: run `npm install` at the repository root.
