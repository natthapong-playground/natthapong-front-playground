# Natthapong Frontend Playground

[![Angular 21](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)](frontend-playground/package.json)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](frontend-playground/package.json)
[![Status: learning project](https://img.shields.io/badge/status-learning_project-F59E0B)](#project-status)

An Angular dashboard for exploring secure authentication, role-aware interfaces,
audit logs, and an interactive world clock.

## Highlights

- Explore a searchable world map and keep a personalized list of live clocks.
- Register, sign in, and move through guarded routes with automatic JWT refresh.
- Inspect filtered API activity from a `SuperAdmin`-only audit dashboard.
- Keep selected countries and display preferences between browser sessions.
- Run a responsive Angular Material interface on desktop and mobile.
- Start on Windows without globally installing Node.js, npm, or Angular CLI.

## Overview

Natthapong Frontend Playground is the browser client for the
[Natthapong Backend Playground](https://github.com/natthapong-playground/natthapong-back-playground).
It combines an account dashboard with a backend-synchronized world clock to
demonstrate a practical Angular application built with standalone components,
signals, lazy routes, RxJS, and Angular Material.

The project is designed for learning and experimentation. It is not a hosted
service, and the companion API must be running locally for authentication,
profile, audit-log, country, and clock features to work.

### Author

Created and maintained by
[Natthapong Playground](https://github.com/natthapong-playground).

## Usage

After starting both projects, open <http://localhost:4200/> and:

1. Create an account or sign in.
2. Open **World Clock**, search for a country, or select one on the map.
3. Add countries to the clock list and customize the visible panels.
4. Sign in as a `SuperAdmin` to filter and page through backend audit logs.

The main application routes are:

| Route | Purpose | Access |
| --- | --- | --- |
| `/login` | Sign in | Signed-out users |
| `/register` | Create an account | Signed-out users |
| `/profile` | View account details and role | Authenticated users |
| `/world-clock` | Search countries and manage live clocks | Authenticated users |
| `/audit-logs` | Inspect backend request activity | `SuperAdmin` |

## Installation

The frontend expects the companion backend at
`http://127.0.0.1:8000/api/v1`. [Install and start the backend](https://github.com/natthapong-playground/natthapong-back-playground#installation)
before using the application.

### Windows (recommended)

Requirements: Windows 10 or 11, PowerShell 5.1 or newer, and an internet
connection for the first setup.

```bat
git clone https://github.com/natthapong-playground/natthapong-front-playground.git
cd natthapong-front-playground
setup.bat
start.bat
```

Open <http://localhost:4200/>. The scripts download a verified Node.js 22.23.1
toolchain and install locked dependencies inside the repository. Nothing is
installed globally. `start.bat` reruns setup when the lock file changes.

### Linux and macOS

Install Node.js 22.12 or newer and npm 11, then run:

```bash
git clone https://github.com/natthapong-playground/natthapong-front-playground.git
cd natthapong-front-playground/frontend-playground
npm ci
npm start
```

The Angular CLI is already a project dependency; a global `ng` installation is
not required.

## Configuration

The development API URL is defined in
[`frontend-playground/src/environments/environment.ts`](frontend-playground/src/environments/environment.ts).
Production builds replace it with `environment.prod.ts`. Change the selected
file's settings when the backend is served from another origin.

The checked-in Angular development and production environments already contain
this project's public Google OAuth Web Client ID, so the Google buttons render on
login and registration. Google Cloud must authorize `http://localhost:4200` and
the eventual production frontend origin. The backend private `.env` must contain
the same value as `GOOGLE_CLIENT_ID`.

Forks should replace `googleClientId` with their own OAuth Web Client ID and add
their origins in Google Cloud. No Google client secret belongs in the frontend or
is required for this flow.

Angular environment files are compiled into browser-readable JavaScript. Never
store passwords, private keys, or API secrets in them.

## Development

Run npm commands from `frontend-playground/`:

| Command | Purpose |
| --- | --- |
| `npm start` | Start the development server on port 4200 |
| `npm run build` | Create an optimized build in `dist/` |
| `npm run watch` | Rebuild continuously with development settings |
| `npm test` | Run unit tests with Vitest |

Linting and end-to-end testing are not currently configured. A container image
can be built from `frontend-playground/` with:

```bash
docker build -t natthapong-frontend .
docker run --rm -p 8080:80 natthapong-frontend
```

See [`DETAILS.md`](DETAILS.md) for a compact command reference.

## Architecture

```text
frontend-playground/src/app/
|-- core/       Models, route guards, HTTP interceptor, and API services
`-- features/   Authentication, profile, audit-log, and world-clock screens
```

The application uses JWT access and refresh tokens, adds bearer credentials
through an HTTP interceptor, and lazy-loads guarded feature routes. Country
selections and display preferences are stored in `localStorage`; the map data is
served from `public/world.geojson`.

For deeper implementation details, see:

- [`docs/structures.txt`](docs/structures.txt) for the application map
- [`docs/files.txt`](docs/files.txt) for file responsibilities
- [`docs/methods.txt`](docs/methods.txt) for routes, services, and behavior

## Project Status

This is a work-in-progress learning project, not a production-ready application.
The current build still uses the local development API URL, the stock Nginx
image does not provide an Angular route fallback, and browser-stored tokens
require stronger protection for production use.

## Feedback and Contributing

Feedback and pull requests are welcome. Public issue creation is currently
restricted by the repository settings, so propose fixes through a
[pull request](https://github.com/natthapong-playground/natthapong-front-playground/pulls).
Keep the living files under [`docs/`](docs/) synchronized with behavior changes.

## License

The project's original code and documentation are available under the
[MIT License](LICENSE).
