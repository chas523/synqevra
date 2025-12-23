# Gateway

## Overview
Gateway is based on ThingsBoard Gateway Docker container. It connects to ThingsBoard CE instance and forwards data from various protocols (MQTT, CoAP, HTTP, LWM2M) to ThingsBoard.
Uses official ThingsBoard Gateway docker-compose setup with minor modifications.

## Main service:
- `tb-gateway`: ThingsBoard Gateway – open‑source IoT gateway for device data

### Ports:
- `5000:5000` - used by REST connectors, mapped to host `5000`
- (optional) `1052:1052` - BACnet connector
- (optional) `5026:5026` - Modbus TCP connector (Modbus Slave)
- (optional) `50000:50000/tcp` - Socket connector with type TCP
- (optional) `50000:50000/udp` - Socket connector with type UDP

## Supporting service:
- `mosquitto`: Eclipse Mosquitto – MQTT broker

### Ports:
- `1884:1884` - MQTT port, mapped to host `1884`
- `9001:9001` - WebSocket port, mapped to host `9001`

### Configuration:
- `mosquitto/config/mosquitto.conf` - main configuration file for Mosquitto broker
- set listener to port `1884` and allow anonymous connections for simplicity
- logs data to `/mosquitto/log/mosquitto.log` file
- optional listener for WebSocket on port `9001` with protocol `websockets`

## Default connector configuration:
### Basic settings:
- `default-connector-config.json` - default configuration for MQTT connector
- connects to Mosquitto broker on `host.docker.internal` at port `1884`
- allows anonymous connections

### Topic filters and data mapping:
- Telemetry/attributes ingestion:
    - `topicFilter`: `data/`
    - Converter: `type=json`
    - Device identification:
        - `deviceNameJsonExpression`: `"Demo Device"` (static device name, can be changed if needed)
        - `deviceTypeJsonExpression`: `"default"`

## Examples:
- Publish telemetry/attributes:
    - Topic: `data/`
    - Payload:
      ```json
      {"frequency": 50, "power": 1200, "temperature": 23, "humidity": 40}
      ```
      
- Connect a device by payload:
    - Topic: `sensor/connect`
    - Payload:
      ```json
      {"SerialNumber": "Device001"}
      ```
      
- Connect a device by topic:
    - Topic: `sensor/Device001/connect`
    - Payload: `{}` (or any JSON; device name is taken from the topic)

- Disconnect analogously via `sensor/disconnect` or `sensor/Device001/disconnect`