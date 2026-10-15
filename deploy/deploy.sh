#!/usr/bin/env bash
# 本地构建并同步到 VPS：  ./deploy/deploy.sh user@your-vps
set -euo pipefail
HOST="${1:?用法: deploy.sh user@host}"
cd "$(dirname "$0")/.."
python3 build.py
# data/ 由服务器上的定时任务维护，同步时跳过
rsync -az --delete --exclude 'data/' dist/ "$HOST:/var/www/classfabric/"
echo "已部署。"
