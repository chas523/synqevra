#!/bin/bash

cd /wakaama

cmake -S examples/client -B build-client -DWAKAAMA_ENABLE_EXAMPLES=ON -DWAKAAMA_MODE_CLIENT=ON
cmake --build build-client

./build-client/lwm2mclient -h host.docker.internal -n lwm2m-client -p 5685 -c

# cmake -S examples/lightclient -B build-lightclient
# cmake --build build-lightclient

# ./build-lightclient/lightclient -n lwm2m-client -l 5685