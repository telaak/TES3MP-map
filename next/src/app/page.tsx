"use client";
import Iframe from "react-iframe";
import { useState } from "react";
import { Box, Stack } from "@mui/material";
import PlayerOverlay from "@/components/PlayerOverlay";
import { playerQuery } from "@/functions";

export default function Home() {
  const players = playerQuery();

  const [isFrameLoaded, setIsFrameLoaded] = useState<boolean>(false);

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
              console.log(player);
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
