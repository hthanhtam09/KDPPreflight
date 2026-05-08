#!/bin/bash
# KDPPreflight Dev Server Starter
# This script keeps the Next.js dev server running

cd /home/z/my-project

while true; do
  # Check if server is already running
  if pgrep -f "next-server" > /dev/null; then
    echo "Server already running"
    sleep 10
    continue
  fi
  
  echo "Starting Next.js dev server..."
  NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS="--max-old-space-size=512" \
    node ./node_modules/.bin/next dev -p 3000 > /tmp/next-dev.log 2>&1 &
  
  # Wait for server to start
  sleep 5
  
  if pgrep -f "next-server" > /dev/null; then
    echo "Server started successfully"
  else
    echo "Server failed to start"
  fi
  
  sleep 15
done
