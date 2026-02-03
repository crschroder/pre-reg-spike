#!/bin/bash
set -e
cd /home/site/wwwroot
export PORT=8080
echo "Starting API server with PORT=$PORT"
echo "Current directory: $(pwd)"
echo "Files in dist:"
ls -la dist/ || echo "dist not found!"
echo "Starting node process..."
exec node dist/api-server.js 2>&1

