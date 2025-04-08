FROM ich777/docker-openmw-tes3mp

WORKDIR /openmw/

RUN apt update && apt install lua-socket -y

COPY map.lua /map/
COPY customScripts.lua /map/

COPY start-server.sh /opt/scripts/

ENTRYPOINT ["/opt/scripts/start.sh"]