FROM ubuntu:22.04

RUN apt-get update && apt-get install -y nano && apt-get install -y git
RUN apt-get install -y libcoap2-bin && apt-get install -y mosquitto mosquitto-clients && apt-get install -y curl
RUN apt-get install -y python3-pip cmake clang-format clang-format-14 clang-tools-14 pkg-config build-essential libcunit1-dev ninja-build 
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y gcovr

COPY mqtt.sh /mqtt.sh
COPY coap.sh /coap.sh
COPY lwm2m.sh /lwm2m.sh
COPY http.sh /http.sh
COPY mqtt_connector.sh /mqtt_connector.sh

COPY coap-data.json /coap-data.json

RUN chmod +x /mqtt.sh && chmod +x /coap.sh && chmod +x /lwm2m.sh && chmod +x /http.sh && chmod +x /mqtt_connector.sh
RUN chmod +x /coap-data.json

RUN mkdir /wakaama && cd /wakaama
RUN git clone --recurse-submodules https://github.com/eclipse/wakaama.git
RUN pip3 install -r /wakaama/tools/requirements-compliance.txt
CMD ["bash"]