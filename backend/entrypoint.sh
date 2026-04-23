#!/bin/sh
if [ ! -f /app/data/categories.json ]; then
  echo "Inicializujem dáta..."
  cp -r /app/data-init/. /app/data/
fi
exec node backend/server.js
