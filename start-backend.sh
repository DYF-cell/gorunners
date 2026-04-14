#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"

cd "$SERVER_DIR"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt

export GORUNNERS_DB="mysql+pymysql://root:Dyfsyz666@127.0.0.1:3306/GORUNNERS_DB?charset=utf8mb4"

if command -v mysql >/dev/null 2>&1; then
  MYSQL_PWD="Dyfsyz666" mysql -uroot -h127.0.0.1 -P3306 -e "CREATE DATABASE IF NOT EXISTS \`GORUNNERS_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
fi

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
