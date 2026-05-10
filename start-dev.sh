#!/bin/bash
cd /home/z/my-project
exec >> /home/z/my-project/dev.log 2>&1
echo "[$(date)] === Starting dev server ==="

# Start the server
bun run dev &
SERVER_PID=$!

# Wait for readiness
for i in $(seq 1 10); do
  if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
    echo "[$(date)] Server ready"
    break
  fi
  sleep 1
done

# Keep the process alive by pinging it periodically
while kill -0 $SERVER_PID 2>/dev/null; do
  curl -s -o /dev/null http://localhost:3000 2>/dev/null || true
  sleep 10
done

echo "[$(date)] Server process died"
