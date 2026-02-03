#!/bin/bash
set -e
cd /home/site/wwwroot
export PORT=8080
echo "Starting server with PORT=$PORT"
echo "Current directory: $(pwd)"
echo "Files in dist/server:"
ls -la dist/server/ || echo "dist/server not found!"
echo "Starting node process..."
exec node dist/server/server.js 2>&1

