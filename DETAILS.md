# Developer Command Reference

The full project guide is in [`README.md`](README.md).

## Isolated Windows Setup

Run these from the repository root. They use only the ignored project-local `.venv/`
tool directory and `frontend-playground/node_modules/`.

```bat
setup.bat
start.bat
```

Open `http://localhost:4200/`. No global Node.js, npm, Python, or Angular CLI
installation is required.

## Manual Setup

On non-Windows systems with Node.js 22.12+ and npm 11 already available:

```bash
cd frontend-playground
npm ci
npm start
```

## Build and Test

```bash
cd frontend-playground
npm run build
npm test
```

## Docker

```bash
docker build -t natthapong-frontend .
docker run --rm -p 8080:80 natthapong-frontend
```

Open `http://localhost:8080/`. This repository does not currently contain a Docker
Compose file.
