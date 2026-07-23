# Developer Command Reference

The full project guide is in [`README.md`](README.md). Run application commands from
`frontend-playground/`.

## Install and Start

```bash
npm ci
npm start
```

Open `http://localhost:4200/`. A global Angular CLI installation is not required.

## Build and Test

```bash
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
