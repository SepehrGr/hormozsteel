#!/usr/bin/env bash
# Deploy, roll back, or inspect hs.sepehrgr.dev. Installed at /srv/hormozsteel/deploy.sh;
# CI reaches it only through /usr/local/bin/deploy-gate.
# Usage: deploy.sh deploy <sha-tag> | rollback | status
set -euo pipefail

APP_DIR=/srv/hormozsteel
HEALTH_URL=http://127.0.0.1:3001/   # the home page reads the database, so it checks both
cd "$APP_DIR"

log() { echo "[$(date -u +%FT%TZ)] $*"; }
tag_in() { grep -E '^IMAGE_TAG=' "$1" 2>/dev/null | cut -d= -f2 || true; }
# .env: secrets, written once by hand. tag.env: the image tag, rewritten by every deploy.
compose() { docker compose --env-file .env --env-file tag.env "$@"; }

health_check() {
  for _ in $(seq 1 30); do                       # up to ~60 seconds
    if curl -fsS -o /dev/null --max-time 3 "$HEALTH_URL"; then
      log "Health check passed"; return 0
    fi
    sleep 2
  done
  log "Health check FAILED"; return 1
}

# Pull, then `up`: postgres (healthy) -> migrate (exits 0) -> app. A failed migration
# fails `up`, so the app never starts on a half-migrated database.
# Migrations aren't undone by a rollback: keep each one compatible with the previous app.
start() {
  compose pull --quiet
  compose up -d --remove-orphans
}

case "${1:-}" in
  deploy)
    NEW_TAG="${2:-}"
    # Accept only real commit tags: "sha-" + 40 hex characters. Blocks typos and injection.
    [[ "$NEW_TAG" =~ ^sha-[0-9a-f]{40}$ ]] || { log "Invalid tag: '$NEW_TAG'"; exit 2; }
    OLD_TAG="$(tag_in tag.env)"
    log "Deploying $NEW_TAG (previous: ${OLD_TAG:-none})"
    if [[ -n "$OLD_TAG" ]]; then cp tag.env tag.env.previous; fi
    echo "IMAGE_TAG=$NEW_TAG" > tag.env
    if start && health_check; then
      docker image prune -f > /dev/null          # remove unused image layers to save disk
      log "Deploy OK: $NEW_TAG"
    else
      if [[ -f tag.env.previous ]]; then
        log "Automatic rollback to $(tag_in tag.env.previous)"
        cp tag.env.previous tag.env
        if start && health_check; then log "Rollback OK"; else log "Rollback ALSO failed: manual attention needed"; fi
      fi
      exit 1
    fi
    ;;
  rollback)
    [[ -f tag.env.previous ]] || { log "No previous version recorded"; exit 1; }
    cp tag.env tag.env.tmp && cp tag.env.previous tag.env && mv tag.env.tmp tag.env.previous
    log "Rolling back to $(tag_in tag.env)"
    start && health_check
    ;;
  status)
    log "Current: $(tag_in tag.env)   Previous: $(tag_in tag.env.previous)"
    if [[ -n "$(tag_in tag.env)" ]]; then compose ps; else log "Not deployed yet"; fi
    ;;
  *)
    echo "Usage: $0 deploy <sha-tag> | rollback | status" >&2; exit 2
    ;;
esac
