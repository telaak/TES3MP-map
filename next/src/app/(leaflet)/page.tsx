"use client";
import Iframe from "react-iframe";
import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import PlayerOverlay from "@/components/PlayerOverlay";
import {
  usePlayerQuery,
} from "@/functions";
import {
  getLeafletFrame,
} from "./iframe";
import MapMarker from "@/components/MapMarker";

export default function Home() {
  const players = usePlayerQuery();

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
        {isMapLoaded &&
          players.data &&
          players.data.map((p) => <MapMarker key={p.name} player={p} />)}
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
