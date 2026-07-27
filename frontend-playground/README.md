# Frontend Playground Application

This directory contains the Angular 21 application for the Natthapong Frontend
Playground. Read the repository-level [`README.md`](../README.md) for features,
architecture, routes, backend requirements, Docker notes, and known limitations.

## Quick Start

On Windows, run the isolated root scripts from this directory:

```bat
..\setup.bat
..\start.bat
```

These scripts keep Node.js, npm, the npm cache, and packages inside the repository.
No global installation is required. For manual or non-Windows setup with Node.js
22.12+ and npm 11 already installed:

```bash
npm ci
npm start
```

Open `http://localhost:4200/`. The development backend is expected at
`http://127.0.0.1:8000/api/v1`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Angular development server |
| `npm run build` | Create the production build |
| `npm run watch` | Continuously create development builds |
| `npm test` | Run unit tests with Vitest |

Lint and end-to-end scripts are not configured.

## Google Authentication

The login and registration pages include Google Identity Services buttons. The
public OAuth Web Client ID is configured in `src/environments/environment.ts` and
`environment.prod.ts`; the backend private `.env` must use the same value as
`GOOGLE_CLIENT_ID`. Authorize `http://localhost:4200` in Google Cloud for local use.
No Google client secret is used or stored in the browser.

## Source Areas

- `src/app/core/`: models, guards, authentication interceptor, and API services
- `src/app/features/auth/`: email/password and Google login/registration screens
- `src/app/features/dashboard/`: profile, audit logs, and world clock
- `public/`: favicon, logo, and world map data
- `src/environments/`: API URL and public Google OAuth client ID configuration

See [`../docs/structures.txt`](../docs/structures.txt) for the complete map.
