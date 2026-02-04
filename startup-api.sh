#!/bin/bash
set -e
cd /home/site/wwwroot
export PORT=8080
echo "Starting API server with PORT=$PORT"
echo "Current directory: $(pwd)"
echo "Starting node process..."
exec node api-server.js 2>&1

