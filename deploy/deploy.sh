#!/usr/bin/env bash
# Deploy, roll back, or inspect hs.sepehrgr.dev. Installed at /srv/hormozsteel/deploy.sh;
# CI reaches it only through /usr/local/bin/deploy-gate (deploy, rollback, status).
# CI doesn't update this file: after changing it, copy it to the server and
# `sudo install -o root -g root -m 755 deploy.sh /srv/hormozsteel/deploy.sh`.
# Usage: deploy.sh deploy <sha-tag> | rollback | status | restart | seed | backup | restore <file>
set -euo pipefail

APP_DIR=/srv/hormozsteel
IMAGE=sepehrgr7/hormozsteel
HEALTH_URL=http://127.0.0.1:3001/   # the home page reads the database, so it checks both
BACKUP_DIR="$APP_DIR/backups"
KEEP_BACKUPS=10
cd "$APP_DIR"
umask 077   # backups hold every password hash: files this script makes are deploy-only

# One change at a time: a deploy, the hourly reset and a restore wait for each other
if [[ "${1:-}" != status ]]; then exec 9> .lock; flock 9; fi

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

# Pull, migrate while the old app keeps serving, then replace only the app container.
# A failed migration stops here, so the app never starts on a half-migrated database.
# Migrations aren't undone by a rollback: keep each one compatible with the previous app.
# Chained with &&: `set -e` is off inside the `if start` callers, so each step must stop the next.
# `start backup` (deploys) dumps the database before migrating; rollbacks skip it, since
# an older version brings no new migrations, and a broken backup mustn't block a rollback.
start() {
  compose pull --quiet &&
    { [[ "${1:-}" != backup ]] || backup "before-$(tag_in tag.env)"; } &&
    compose run --rm migrate &&
    compose up -d --no-deps --remove-orphans app
}

# A plain-SQL dump (--clean: restoring it replaces what's there). Skipped before the
# first deploy, when there's no database yet; keeps the newest $KEEP_BACKUPS.
# ponytail: backups stay on this server; copy them off it if the data ever matters.
backup() {
  [[ -n "$(compose ps -q --status running postgres)" ]] || { log "No database running yet, no backup"; return 0; }
  install -d -m 700 "$BACKUP_DIR"
  local file
  file="$BACKUP_DIR/$(date -u +%Y%m%dT%H%M%SZ)-$1.sql.gz"
  if ! compose exec -T postgres pg_dump -U postgres -d ahanhormoz_demo --clean --if-exists | gzip > "$file"; then
    rm -f "$file"; log "Backup FAILED"; return 1
  fi
  log "Backup: $file ($(du -h "$file" | cut -f1))"
  ls -1t "$BACKUP_DIR"/*.sql.gz | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm --
}

# Write a tag file, or delete it when there's no tag to record
set_tag() { if [[ -n "$2" ]]; then echo "IMAGE_TAG=$2" > "$1"; else rm -f "$1"; fi; }

# Keep the current and previous versions (rollback needs the previous one) and
# delete older ones; `image prune` alone only removes untagged layers.
prune_images() {
  local now prev keep
  now="$(tag_in tag.env)"; prev="$(tag_in tag.env.previous)"
  keep=" $now tools-$now ${prev:+$prev tools-$prev} "
  docker image ls "$IMAGE" --format '{{.Tag}}' | while read -r tag; do
    [[ "$keep" == *" $tag "* ]] || docker image rm "$IMAGE:$tag" > /dev/null || true
  done
  docker image prune -f > /dev/null
}

case "${1:-}" in
  deploy)
    NEW_TAG="${2:-}"
    # Accept only real commit tags: "sha-" + 40 hex characters. Blocks typos and injection.
    [[ "$NEW_TAG" =~ ^sha-[0-9a-f]{40}$ ]] || { log "Invalid tag: '$NEW_TAG'"; exit 2; }
    OLD_TAG="$(tag_in tag.env)"; OLD_PREV="$(tag_in tag.env.previous)"
    log "Deploying $NEW_TAG (previous: ${OLD_TAG:-none})"
    if [[ -n "$OLD_TAG" ]]; then set_tag tag.env.previous "$OLD_TAG"; fi
    set_tag tag.env "$NEW_TAG"
    if start backup && health_check; then
      prune_images
      log "Deploy OK: $NEW_TAG"
    else
      # Put both tag files back as they were, so a failed deploy leaves no trace,
      # including the rollback point
      set_tag tag.env "$OLD_TAG"; set_tag tag.env.previous "$OLD_PREV"
      if [[ -n "$OLD_TAG" ]]; then
        log "Automatic rollback to $OLD_TAG"
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
  restart)
    # Re-read .env after rotating a secret, without changing the version or rollback point
    [[ -n "$(tag_in tag.env)" ]] || { log "Not deployed yet"; exit 1; }
    compose up -d --no-deps app && health_check
    ;;
  seed)
    # Wipes the database and reloads the demo data. Not reachable through deploy-gate.
    [[ -n "$(tag_in tag.env)" ]] || { log "Not deployed yet"; exit 1; }
    compose run --rm migrate yarn db:seed
    ;;
  backup)
    backup manual
    ;;
  restore)
    FILE="${2:-}"
    [[ -f "$FILE" ]] || { log "No such backup: '$FILE'. Newest:"; ls -1t "$BACKUP_DIR" 2>/dev/null | head -5; exit 2; }
    log "Restoring $FILE"
    compose stop app
    # One transaction: if any statement fails, the database stays exactly as it was
    if gunzip -c "$FILE" | compose exec -T postgres psql -U postgres -d ahanhormoz_demo \
        -q --single-transaction -v ON_ERROR_STOP=1 > /dev/null; then
      log "Restore OK"; RC=0
    else
      log "Restore FAILED: rolled back, the database is unchanged"; RC=1
    fi
    compose up -d --no-deps app && health_check
    exit "$RC"
    ;;
  *)
    echo "Usage: $0 deploy <sha-tag> | rollback | status | restart | seed | backup | restore <file>" >&2; exit 2
    ;;
esac
