#!/bin/sh
# Waits for Ollama to be ready then pulls the model if not already present
until curl -sf http://ollama:11434/api/tags > /dev/null; do
  echo "Waiting for Ollama..."
  sleep 2
done

MODEL="llama3.2:3b"
if curl -sf http://ollama:11434/api/tags | grep -q "$MODEL"; then
  echo "Model $MODEL already present"
else
  echo "Pulling $MODEL..."
  curl -X POST http://ollama:11434/api/pull -d "{\"name\":\"$MODEL\"}"
fi
