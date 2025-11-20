#!/usr/bin/env bash
set -e

TIMEOUT=30

while getopts ":t:" opt; do
  case $opt in
    t) TIMEOUT=$OPTARG ;;
    *) echo "Invalid option"; exit 1 ;;
  esac
done

shift $((OPTIND-1))

HOSTPORT="$1"
HOST=$(echo "$HOSTPORT" | cut -d: -f1)
PORT=$(echo "$HOSTPORT" | cut -d: -f2)

echo "Waiting for $HOST:$PORT..."

for i in $(seq $TIMEOUT); do
  if nc -z "$HOST" "$PORT"; then
    echo "$HOST:$PORT is up!"
    exit 0
  fi
  sleep 1
done

echo "Timeout waiting for $HOST:$PORT"
exit 1
