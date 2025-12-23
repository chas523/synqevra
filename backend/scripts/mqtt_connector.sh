#!/bin/bash

HOST="host.docker.internal"
PORT="1884"
TOPIC="data/"
# MESSAGE='{"serialNumber": "SN-001", "sensorType": "Thermometer", "sensorModel": "T1000", "temp": 42, "hum": 58}'
MESSAGE='{"frequency": 200, "temperature": 200, "humidity": 200}'

# mosquitto_sub -h "$HOST" -p "$PORT" -t "$TOPIC" &
# sleep 1
mosquitto_pub -h "$HOST" -p "$PORT" -t "$TOPIC" -m "$MESSAGE"