#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"

load_env_file() {
  local env_file="$1"
  if [ -f "$env_file" ]; then
    set -a
    . "$env_file"
    set +a
  fi
}

load_env_file "$ROOT_DIR/.env"
load_env_file "$ROOT_DIR/.env.local"

cd "$SERVER_DIR"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt

if [ -n "${MYSQL_HOST:-}" ]; then
  MYSQL_PORT="${MYSQL_PORT:-3306}"
  MYSQL_USER="${MYSQL_USER:-root}"
  MYSQL_DATABASE="${MYSQL_DATABASE:-gorunners}"

  if command -v mysql >/dev/null 2>&1; then
    MYSQL_PWD="${MYSQL_PASSWORD:-}" mysql \
      -u"${MYSQL_USER}" \
      -h"${MYSQL_HOST}" \
      -P"${MYSQL_PORT}" \
      -e "CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  else
    printf '%s\n' "mysql client not found; skipping CREATE DATABASE for ${MYSQL_DATABASE}."
  fi
elif [[ "${GORUNNERS_DB:-}" == mysql* ]]; then
  printf '%s\n' "Using MySQL from GORUNNERS_DB. Ensure the target database already exists."
else
  printf '%s\n' "No MySQL env vars found. Backend will use SQLite at ${SERVER_DIR}/gorunners.db."
fi

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
