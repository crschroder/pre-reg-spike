#!/bin/bash
set -e
cd /home/site/wwwroot
export PORT=8080
echo "Starting server with PORT=$PORT"
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la | grep -E "server-wrapper|dist" || echo "server-wrapper or dist not found!"
echo "Starting node process..."
exec node server-wrapper.js 2>&1

