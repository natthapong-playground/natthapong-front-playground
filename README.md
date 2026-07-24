# Natthapong Frontend Playground

An Angular 21 dashboard for experimenting with authentication, role-based access,
API-driven user tools, and an interactive world clock. The project is a work in
progress and currently expects a separate backend API.

## Features

- Account registration and sign-in with JWT access and refresh tokens
- Automatic token refresh and protected, lazy-loaded routes
- User profile details and role-aware navigation
- SuperAdmin-only audit-log filtering, paging, and request statistics
- Interactive world map with country search and click-to-add clocks
- Live country clocks synchronized with the backend every 60 seconds
- Browser-persisted country selections and world-clock display preferences
- Angular Material UI with responsive authentication and dashboard screens

## Technology

| Area | Technology |
| --- | --- |
| Framework | Angular 21 standalone components |
| Language | TypeScript 5.9 |
| UI | Angular Material 21 and Angular CDK |
| State | Angular signals and computed signals |
| Async data | Angular HttpClient and RxJS 7 |
| Forms | Angular reactive forms and template-driven filters |
| Tests | Vitest through Angular's unit-test builder |
| Container | Node 22 build stage and Nginx runtime |

## Repository Layout

```text
.
|-- setup.bat                Install an isolated Windows toolchain and dependencies
|-- start.bat                Start the app with the isolated Windows toolchain
|-- frontend-playground/     Angular application and container definition
|   |-- public/              Static images and world map GeoJSON
|   `-- src/
|       |-- app/core/        Models, guards, interceptor, and API services
|       |-- app/features/    Authentication and dashboard pages
|       `-- environments/    API environment settings
|-- docs/                    Living technical and plain-English documentation
|-- DETAILS.md               Short developer command reference
`-- README.md                Project entry point
```

See [`docs/structures.txt`](docs/structures.txt) for the complete application map,
[`docs/files.txt`](docs/files.txt) for file responsibilities, and
[`docs/methods.txt`](docs/methods.txt) for routes and behavior.

## Windows Setup (Recommended)

Requirements:

- Windows 10 or 11
- Windows PowerShell 5.1 or newer (included with supported Windows versions)
- An internet connection for the first setup
- Git, only when cloning instead of downloading the GitHub ZIP

Node.js, npm, Python, a Python virtual environment, and a global Angular CLI are
not required. From the repository root, run:

```bat
setup.bat
start.bat
```

Open `http://localhost:4200/`. `start.bat` also accepts Angular development-server
options, for example:

```bat
start.bat --port 4300 --open
```

`setup.bat` downloads Node.js 22.23.1 from nodejs.org, verifies its SHA-256 hash,
and stores it under the ignored `.venv/` directory. It installs npm 11.11.0 into
that same directory, keeps npm's cache there, and installs the locked application
packages into `frontend-playground/node_modules/`. Nothing is installed globally.
Re-run `setup.bat` whenever `package-lock.json` changes. Delete `.venv/` and
`frontend-playground/node_modules/` if you want to remove all local setup artifacts.

The `.venv` name is used for the project-local Node toolchain. This is an Angular
project, so a Python virtual environment would not isolate the dependencies it
actually uses.

## Clone And Run

The backend is not included in this repository. It must implement the API contract
listed below and be available at `http://127.0.0.1:8000/api/v1` for all screens to
work.

```bat
git clone https://github.com/natthapong-playground/natthapong-front-playground.git
cd natthapong-front-playground
setup.bat
start.bat
```

Open `http://localhost:4200/`. The Angular development server reloads when source
files change.

## Manual Setup (Other Platforms)

Install Node.js 22.12 or newer and npm 11, then run:

```bash
cd frontend-playground
npm ci
npm start
```

The Angular CLI remains a project dependency. Do not install `ng` globally.

## Available Commands

Run these commands from `frontend-playground/`:

| Command | Purpose |
| --- | --- |
| `npm start` | Start the development server on port 4200 |
| `npm run build` | Create an optimized build in `dist/` |
| `npm run watch` | Rebuild continuously with development settings |
| `npm test` | Run the Vitest unit-test suite |

Linting and end-to-end testing are not currently configured.

Windows users can run these commands with the isolated toolchain after `setup.bat`
by using `..\.venv\node-v22.23.1-win-<architecture>\npm.cmd` from
`frontend-playground/`. `start.bat` provides the normal development shortcut.

## Application Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/login` | Signed-out users | Sign in |
| `/register` | Signed-out users | Create an account and sign in |
| `/profile` | Authenticated users | View account and role information |
| `/world-clock` | Authenticated users | Use the interactive world clock |
| `/audit-logs` | SuperAdmin only | Inspect filtered backend request logs |

The root URL and unknown routes redirect to `/profile`. Route guards then send
unauthenticated visitors to `/login`.

## Backend API

The frontend currently uses these endpoints below the configured API base URL:

| Method | Endpoint | Used for |
| --- | --- | --- |
| `POST` | `/login` | Form-encoded authentication |
| `POST` | `/refresh-token` | Access and refresh token rotation |
| `POST` | `/logout` | Session revocation |
| `POST` | `/users/register` | Account creation |
| `GET` | `/users/myprofile` | Current user details |
| `GET` | `/audit-logs` | Filtered and paged audit records |
| `GET` | `/countries` | Country search |
| `GET` | `/countries/{code}` | Country details |
| `GET` | `/clock?code=TH,GB` | Synchronized clock snapshot |

Authenticated requests receive an `Authorization: Bearer <token>` header. The map
itself is loaded from the local `public/world.geojson` asset.

## Configuration

Development API configuration is in
`frontend-playground/src/environments/environment.ts`:

```ts
apiUrl: 'http://127.0.0.1:8000/api/v1'
```

Before deploying, configure a production API URL and add an Angular production file
replacement or another runtime configuration strategy. The current `angular.json`
does not replace `environment.ts`, so production builds still use the local URL.

Frontend environment files are compiled into browser-readable JavaScript. Never put
passwords, API secrets, private keys, or private tokens in `src/environments/`.

## Docker

Build and run the frontend container from `frontend-playground/`:

```bash
docker build -t natthapong-frontend .
docker run --rm -p 8080:80 natthapong-frontend
```

Open `http://localhost:8080/`.

The current image uses stock Nginx configuration. Directly refreshing a client-side
route such as `/profile` may return a 404 until an SPA fallback configuration is
added. No Docker Compose file is currently included.

## Browser Storage

The application stores the following data in `localStorage`:

- `access_token` and `refresh_token` for the authenticated session
- `world-clock.codes.v1` for selected country codes
- `world-clock.showSearch` and `world-clock.showGrid` for display preferences

Treat tokens as sensitive data. Do not use production credentials while the project
is being used as a learning playground.

## Public Repository Safety

The repository ignore rules exclude `.env` variants, `.npmrc`, private keys,
keystores, service-account credentials, local databases, logs, editor settings,
dependencies, builds, caches, and `.venv/`. The current tracked files and reachable
Git history were scanned before publication; no matching credentials or private keys
were found.

Before each future push, review `git status` and never commit generated files or
secrets. If a real secret is ever committed, removing the file in a later commit is
not sufficient: revoke the secret and clean the Git history before publishing.

## Publish On GitHub

This checkout already uses
`https://github.com/natthapong-playground/natthapong-front-playground.git` as its
`origin`. Confirm the intended commit exists, then publish the current branch with:

```bash
git status
git log --oneline -1
git push -u origin develop
```

Pushing code and making a repository public are separate actions. In GitHub, open
**Settings**, then **General**, then **Danger Zone**, and use **Change repository
visibility** if the repository is still private. Choose a license before inviting
reuse; without a license, public visibility does not grant permission to copy or
modify the code.

## Current Limitations

- A separate backend is required and its source is not part of this repository.
- Production API replacement is not configured yet.
- Nginx does not yet provide a fallback for Angular client-side routes.
- Most unit tests are construction-level checks; behavior coverage remains limited.
- Google Fonts, Material Icons, and flag images depend on external CDNs.
- `npm audit` reports one transitive, development-only Angular CLI advisory chain;
  npm currently offers only a breaking CLI downgrade, so it is not force-applied.

## Documentation

Documentation is maintained alongside code:

- [`docs/README.txt`](docs/README.txt): how to use the living documentation
- [`docs/structures.txt`](docs/structures.txt): frontend tree and route ownership
- [`docs/files.txt`](docs/files.txt): responsibility of each tracked frontend file
- [`docs/methods.txt`](docs/methods.txt): important methods, signals, routes, and APIs
- [`docs/logs.txt`](docs/logs.txt): newest-first documentation changelog

When changing application behavior, update the matching files under `docs/` in the
same commit, following [`docs/CLAUDE.md`](docs/CLAUDE.md).
