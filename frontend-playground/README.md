# Frontend Playground Application

This directory contains the Angular 21 application for the Natthapong Frontend
Playground. Read the repository-level [`README.md`](../README.md) for features,
architecture, routes, backend requirements, Docker notes, and known limitations.

## Quick Start

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

## Source Areas

- `src/app/core/`: models, guards, authentication interceptor, and API services
- `src/app/features/auth/`: login and registration screens
- `src/app/features/dashboard/`: profile, audit logs, and world clock
- `public/`: favicon, logo, authentication background, and world map data
- `src/environments/`: API configuration

See [`../docs/structures.txt`](../docs/structures.txt) for the complete map.
