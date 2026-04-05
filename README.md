# 2048 Game

![CI](https://github.com/millaguie/2048game/actions/workflows/ci.yml/badge.svg)

A browser-based 2048 clone with spectacular explosion animations on every tile merge. Zero persistence — every session is ephemeral.

## Features

- **3 grid sizes**: 4×4 (classic), 5×5, and 6×6
- **Explosion animations**: particles, shockwaves, and flashes on every merge
- **Responsive**: works on desktop (keyboard + WASD) and mobile (swipe)
- **Win/Loss detection**: alerts when you reach 2048 or run out of moves
- **No persistence**: no localStorage, cookies, or backend

## Run Locally

Open `src/index.html` in any browser. No build step required.

## Docker Image

The image is published to GitHub Container Registry on every push to `main`:

```
ghcr.io/millaguie/2048game
```

Available tags:
- `latest` — latest build from `main`
- `sha-<commit>` — pinned to a specific commit (e.g. `sha-91e15a5`)

Pull and run:

```bash
docker pull ghcr.io/millaguie/2048game:latest
docker run -p 8080:80 ghcr.io/millaguie/2048game:latest
```

## Run with Docker Compose

```bash
docker compose up
```

Open [http://localhost:8080](http://localhost:8080).

## Build Locally

```bash
docker build -t 2048 .
docker run -p 8080:80 2048
```

## Deploy with Helm

```bash
helm install 2048 charts/2048
```

Customize values:

```bash
helm install 2048 charts/2048 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=2048.example.com
```

Dry-run to validate manifests:

```bash
helm install --dry-run 2048 charts/2048
```

## Project Structure

```
src/                    # Game source (HTML, CSS, JS)
  index.html
  game.js
  style.css
  animations.js         # Particle/explosion effects
tests/
  e2e/                  # Playwright E2E tests
charts/
  2048/                 # Helm chart (Deployment, Service, Ingress, HPA)
Dockerfile              # Multi-stage nginx build
docker-compose.yml
.github/workflows/ci.yml
```

## CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR to `main`:

1. **Lint** — HTMLHint + JSHint
2. **Test** — Playwright E2E tests
3. **Docker** — Build & push to `ghcr.io` (on `main` only)
4. **Helm** — `helm lint` + dry-run validation

## License

MIT
