#!/bin/bash
# Quick check if server is alive, start if not
if ! curl -sf -o /dev/null http://localhost:3000 2>/dev/null; then
  pkill -f "next dev" 2>/dev/null || true
  sleep 1
  cd /home/z/my-project
  nohup bun run dev > /home/z/my-project/dev.log 2>&1 &
  # Wait for it to be ready
  for i in $(seq 1 10); do
    if curl -sf -o /dev/null http://localhost:3000 2>/dev/null; then
      echo "Server started and ready"
      exit 0
    fi
    sleep 1
  done
  echo "Server failed to start"
  exit 1
else
  echo "Server already running"
  exit 0
fi
