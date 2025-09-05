#!/bin/bash

HOST="host.docker.internal"
PORT="1883"
TOPIC="v1/devices/me/telemetry"
#TOPIC="/telemetry"
AC_TOKEN="cfymWiJGK9XP7DAEnlxx"
MESSAGE='{"frequency": 111, "power": 111, "temperature": 111, "humidity": 111}'

# echo "mosquitto_pub -d -q 1 -h \"$HOST\" -p \"$PORT\" -t \"$TOPIC\" -m \"$MESSAGE\""
# mosquitto_pub -h "$HOST" -p "$PORT" -t "$TOPIC" -m "$MESSAGE" -u "$AC_TOKEN"

mosquitto_pub -d -q 1 -h "$HOST" -p "$PORT" -t "$TOPIC" -m "$MESSAGE" -u "$AC_TOKEN"