#!/bin/bash
cd /home/z/my-project
while true; do
  bun run dev 2>&1 &
  SERVER_PID=$!
  echo "[$(date)] Started server PID $SERVER_PID"
  
  # Wait for the server to be ready
  for i in $(seq 1 10); do
    if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
      echo "[$(date)] Server is ready"
      break
    fi
    sleep 1
  done
  
  # Wait for the process to die
  while kill -0 $SERVER_PID 2>/dev/null; do
    sleep 2
  done
  
  echo "[$(date)] Server died, restarting in 2s..."
  sleep 2
done
