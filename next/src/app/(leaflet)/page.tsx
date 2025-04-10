"use client";
import Iframe from "react-iframe";
import { useEffect, useMemo, useState } from "react";
import { Box, Stack } from "@mui/material";
import PlayerOverlay from "@/components/PlayerOverlay";
import {
  addMarker,
  getCoords,
  spliceMarkers,
  usePlayerQuery,
} from "@/functions";
import {
  LeafletAnimatedMarker,
  getLeafletFrame,
  leafletAnimateMarkerTo,
} from "./iframe";

export default function Home() {
  const players = usePlayerQuery();

  const [isFrameLoaded, setIsFrameLoaded] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  const markers = useMemo(() => {
    const array: L.Marker[] = [];
    return array;
  }, []);

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
      spliceMarkers(markers, players.data);

      for (const player of players.data) {
        const foundMarker = markers.find(
          (m) => m.options.title! === player.name
        );

        if (foundMarker) {
          const coords = getCoords(player);
          leafletAnimateMarkerTo(foundMarker as LeafletAnimatedMarker, coords);
        } else {
          addMarker(player, markers);
        }
      }
    }
  }, [isMapLoaded, players.data, markers]);

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
        <PlayerOverlay />
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
