#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Создание директорий
mkdir -p "${SCRIPT_DIR}/data/"{postgres,redis,minio}
mkdir -p "${SCRIPT_DIR}/nginx"

# Копирование конфигураций
cp "${SCRIPT_DIR}/configs/nginx.conf" "${SCRIPT_DIR}/nginx/nginx.conf"
cp "${SCRIPT_DIR}/configs/nginx.Dockerfile" "${SCRIPT_DIR}/nginx/Dockerfile"

echo "✅ Конфигурации настроены"
