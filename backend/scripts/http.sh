#!/bin/bash

HTTP_TOKEN="cfymWiJGK9XP7DAEnlxx"
HTTP_MESSAGE='{"httpA":42,"httpB":73}'
HTTP_PORT_MAPPING=8088

curl -v -X POST --data "$HTTP_MESSAGE" http://host.docker.internal:$HTTP_PORT_MAPPING/api/v1/$HTTP_TOKEN/telemetry --header "Content-Type:application/json" 