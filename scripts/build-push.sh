#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "${SCRIPT_DIR}/.env"

# Сборка и отправка Next.js приложения
echo "🏗️ Сборка Next.js приложения..."
docker build -t gothex/nextjs-app:latest -f apps/nextjs/Dockerfile .
docker push gothex/nextjs-app:latest

# Сборка и отправка API
echo "🏗️ Сборка API..."
docker build -t gothex/api:latest -f packages/api/Dockerfile .
docker push gothex/api:latest

echo "✅ Образы собраны и отправлены"
