"use client";
import Iframe from "react-iframe";
import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import PlayerOverlay from "@/components/PlayerOverlay";
import { usePlayerQuery } from "@/functions";
import {
  LeafletAnimatedMarker,
  getLeafletFrame,
  leafletAnimateMarkerTo,
} from "./iframe";

export default function Home() {
  const players = usePlayerQuery();

  const [markers, setMarkers] = useState<L.Marker[]>([]);

  const [isFrameLoaded, setIsFrameLoaded] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const leafletFrame = getLeafletFrame();
      const gamemap = leafletFrame.contentWindow.gamemap;
      const L = leafletFrame.contentWindow.L;

      if (gamemap && gamemap.getMap && L) {
        const actualMap = gamemap.getMap();
        if (actualMap) {
          actualMap.whenReady(() => {
            clearInterval(checkInterval);
            setTimeout(() => {
              setIsMapLoaded(true);
            }, 250);
          });
        }
      }
    }, 10);

    return () => clearInterval(checkInterval);
  }, [isFrameLoaded]);

  useEffect(() => {
    if (isMapLoaded && players.data) {
      const leafletFrame = getLeafletFrame();
      const gamemap = leafletFrame.contentWindow.gamemap;
      const L = leafletFrame.contentWindow.L;

      for (const marker of markers) {
        const foundPlayer = players.data.find((p) =>
          marker.options.title?.startsWith(p.name)
        );

        if (!foundPlayer) {
          marker.remove();
          setMarkers(markers.filter((m) => m !== marker));
        }
      }

      for (const player of players.data) {
        const foundMarker = markers.find((m) =>
          m.options.title?.startsWith(player.name)
        );

        const coords = gamemap.getLatLngs([
          player.location.posX,
          player.location.posY,
        ]);

        if (foundMarker) {
          if (player.location.regionName.length > 0) {
            leafletAnimateMarkerTo(
              foundMarker as LeafletAnimatedMarker,
              coords
            );
            foundMarker.options.title = `${player.name} - ${player.location.regionName}`;
          } else {
            foundMarker.options.title = `${player.name} - ${player.location.cell}`;
          }
        } else {
          const headIcon = L.icon({
            iconUrl: `/head/${player.head}-${player.hair}.png`,
            iconSize: [50, 50],
          });
          const marker = L.marker(coords, {
            icon: headIcon,
            title: `${player.name} - ${player.location.regionName}`,
          }).addTo(gamemap.getMap());
          setMarkers([...markers, marker]);
        }
      }
    }
  }, [isMapLoaded, players.data]);

  return (
    <Stack
      direction="column"
      style={{
        height: "100dvh",
        width: "100dvw",
      }}
    >
      <Box
        sx={{
          height: "100%",
        }}
      >
        {players.data && (
          <PlayerOverlay
            players={players.data}
            onClick={(player) => {
              const foundMarker = markers.find((m) =>
                m.options.title?.startsWith(player.name)
              );
              if (foundMarker) {
                const leafletFrame = getLeafletFrame();
                const gamemap = leafletFrame.contentWindow.gamemap;
                const coords = gamemap.getLatLngs([
                  player.location.posX,
                  player.location.posY,
                ]);
                gamemap.getMap().setView(coords, 16);
              }
            }}
          />
        )}
        <Iframe
          onLoad={() => setIsFrameLoaded(true)}
          styles={{
            border: "none",
            margin: 0,
            padding: 0,
          }}
          id="frame"
          url="/mw"
          width="100%"
          height="100%"
        ></Iframe>
      </Box>
    </Stack>
  );
}
