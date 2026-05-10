#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting dev server..." > /home/z/my-project/dev.log
  bun run dev >> /home/z/my-project/dev.log 2>&1 &
  SERVER_PID=$!
  
  # Wait for server to be ready
  for i in $(seq 1 20); do
    if curl -sf -o /dev/null http://localhost:3000 2>/dev/null; then
      echo "[$(date)] Server ready (PID: $SERVER_PID)" >> /home/z/my-project/dev.log
      break
    fi
    sleep 0.5
  done
  
  # Keep checking if server is alive, restart if not
  FAIL_COUNT=0
  while true; do
    sleep 8
    if curl -sf -o /dev/null http://localhost:3000 2>/dev/null; then
      FAIL_COUNT=0
    else
      FAIL_COUNT=$((FAIL_COUNT + 1))
      echo "[$(date)] Health check failed ($FAIL_COUNT)" >> /home/z/my-project/dev.log
      if [ $FAIL_COUNT -ge 2 ]; then
        echo "[$(date)] Killing dead server" >> /home/z/my-project/dev.log
        kill -9 $SERVER_PID 2>/dev/null
        wait $SERVER_PID 2>/dev/null
        break
      fi
    fi
  done
  
  sleep 3
done
