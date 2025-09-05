#!/bin/bash

COAP_TOKEN="cfymWiJGK9XP7DAEnlxx"

coap-client -m post -f /coap-data.json coap://host.docker.internal/api/v1/$COAP_TOKEN/telemetry