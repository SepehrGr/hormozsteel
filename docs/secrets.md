# Secrets

Every credential the deployed site uses, where it lives, and how to replace it.
Server commands run as `sep` on the VPS; `/srv/hormozsteel` belongs to the `deploy` user.

## Inventory

| Secret | What it's for | Stored in | Readable by |
|---|---|---|---|
| `DOCKERHUB_TOKEN` | CI pushes images to `sepehrgr7/hormozsteel` (Read & Write) | GitHub repo secret | this repo's workflows |
| `DEPLOY_SSH_KEY` | CI runs `deploy <tag>` on the VPS | GitHub `production` environment secret | the `deploy` job only |
| Docker Hub pull token | the VPS pulls images (Public Repo Read-only) | `/home/deploy/.docker/config.json` | `deploy`, root |
| `POSTGRES_PASSWORD` | the database's `postgres` user | `/srv/hormozsteel/.env` (mode 600) | `deploy`, root |
| `NEXTAUTH_SECRET` | signs the session cookies | `/srv/hormozsteel/.env` (mode 600) | `deploy`, root |

Not secrets, kept in the open on purpose:

- the demo logins in [`lib/demo.ts`](../lib/demo.ts), public by design and protected by the user actions
- `DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER` and `DEPLOY_HOST_FINGERPRINT`, stored as GitHub variables
- the throwaway database URL and secret in `.github/workflows/ci.yml`, which only exist on the CI runner

## Rules

- Generate a secret where it's used. The server's `.env` was created on the server and never left it.
- `.env*` is git-ignored and excluded from the Docker build context, so it can't reach a commit or an image.
- GitHub masks secrets in CI logs; never `echo` one or turn on `set -x` around one.
- One credential per machine, with the least access it needs. Each can be revoked alone.
- **After a leak, rotate first.** Assume it has already been copied; cleaning git history comes second.

## Rotating

### `NEXTAUTH_SECRET`

Signs everyone out: their session cookies were signed with the old value.

```bash
sudo -u deploy sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$(openssl rand -base64 32)|" /srv/hormozsteel/.env
sudo -u deploy /srv/hormozsteel/deploy.sh restart
```

### `POSTGRES_PASSWORD`

Postgres reads `POSTGRES_PASSWORD` only when it creates the database. Editing `.env` alone
would lock the app out, so change the password inside the database first.

```bash
cd /srv/hormozsteel
NEW=$(openssl rand -hex 32)   # hex: the password goes inside a URL
sudo -u deploy docker compose --env-file .env --env-file tag.env exec -T postgres \
  psql -U postgres -c "ALTER USER postgres PASSWORD '$NEW'"
sudo -u deploy sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$NEW|" .env
unset NEW
sudo -u deploy ./deploy.sh restart
```

### `DOCKERHUB_TOKEN`

1. Docker Hub → Personal access tokens → generate a new Read & Write token.
2. `gh secret set DOCKERHUB_TOKEN -R SepehrGr/hormozsteel` and paste it.
3. Revoke the old token. The next merge to `main` proves the new one works.

### Docker Hub pull token (VPS)

1. Generate a new Public Repo Read-only token.
2. `sudo -u deploy -H docker login -u sepehrgr7` and paste it.
3. Revoke the old token.

### `DEPLOY_SSH_KEY`

1. On your Mac: `ssh-keygen -t ed25519 -N "" -C github-actions-hormozsteel -f ~/.ssh/hormozsteel_deploy_new`
2. Add the new public key to `/home/deploy/.ssh/authorized_keys` on the VPS, with the same
   prefix as the current line: `command="/usr/local/bin/deploy-gate hormozsteel",restrict`.
3. `gh secret set DEPLOY_SSH_KEY -R SepehrGr/hormozsteel --env production < ~/.ssh/hormozsteel_deploy_new`
4. After a deploy succeeds, delete the old key's line from `authorized_keys`.
