#!/usr/bin/env bash
set -e

echo "=== Halka Canlı Ortam Güncelleniyor ==="

# 1. En son derlenmiş hazır imajları GHCR'dan çek
docker compose -f docker-compose.prod.yml pull

# 2. Yeni imajlarla servisleri ayağa kaldır
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 3. Eski/kullanılmayan artık imajları temizle (disk tasarrufu)
docker image prune -f

echo "=== Güncelleme Başarıyla Tamamlandı! ==="
