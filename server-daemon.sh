#!/bin/bash
cd /home/z/my-project
LOG=/home/z/my-project/dev.log

while true; do
  echo "[$(date)] Starting server..." >> $LOG
  bun run dev >> $LOG 2>&1 &
  PID=$!
  
  # Wait for readiness
  for i in $(seq 1 15); do
    if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
      echo "[$(date)] Server ready (PID $PID)" >> $LOG
      break
    fi
    sleep 1
  done
  
  # Monitor: if port stops responding, kill and restart
  while true; do
    if ! curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
      echo "[$(date)] Port not responding, killing PID $PID" >> $LOG
      kill -9 $PID 2>/dev/null
      wait $PID 2>/dev/null
      break
    fi
    sleep 5
  done
  
  echo "[$(date)] Restarting in 2s..." >> $LOG
  sleep 2
done
