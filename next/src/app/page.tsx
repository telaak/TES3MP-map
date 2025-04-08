"use client";
import Iframe from "react-iframe";
import { AnimatedMarker, animateMarkerTo, getFrame } from "./MwMapIframe";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Player } from "./players/route";
import { Box, Chip, Stack, Typography } from "@mui/material";

export default function Home() {
  const players = useQuery({
    queryKey: ["players"],
    queryFn: () =>
      fetch("/players").then((res) => res.json()) as Promise<Player[]>,
    refetchInterval: 250,
  });

  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const [isFrameLoaded, setIsFrameLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (players.data && isFrameLoaded) {
      const contentWindow = getFrame().contentWindow;
      const frameGoogle = contentWindow.google;
      const map = contentWindow.umMap;

      for (const player of players.data) {
        const marker = markers.find((m) =>
          (m.getTitle() as string).startsWith(player.name)
        );
        if (marker) {
          if (player.location.regionName.length > 0) {
            animateMarkerTo(
              marker as AnimatedMarker,
              contentWindow.umConvertLocToLatLng(
                player.location.posX,
                player.location.posY
              )
            );
            marker.setTitle(`${player.name} - ${player.location.regionName}`);
          } else {
            marker.setTitle(`${player.name} - ${player.location.cell}`);
          }
        } else {
          const newMarker = new frameGoogle.maps.Marker({
            title: `${player.name} - ${player.location.regionName}`,
            position: contentWindow.umConvertLocToLatLng(
              player.location.posX,
              player.location.posY
            ),
            map,
            icon: {
              url: `/head/${player.head}-${player.hair}.png`,
              scaledSize: new frameGoogle.maps.Size(50, 50),
            },
          });
          setMarkers([...markers, newMarker]);
        }
      }
    }
  }, [players.data, isFrameLoaded]);

  return (
    <Stack
      direction="column"
      style={{
        height: "calc(100dvh - 8px)",
        width: "100dvw",
      }}
    >
      <Stack
        style={{
          padding: "0.5em",
        }}
        direction="row"
        spacing={2}
      >
        {players.data &&
          players.data.map((player) => {
            return (
              <Chip
                label={
                  <>
                    <Typography variant="h6">{player.name}</Typography>
                    <Typography variant="body2">
                      {player.location.regionName || player.location.cell}
                    </Typography>
                  </>
                }
                onClick={() => {
                  try {
                    const contentWindow = getFrame().contentWindow;
                    const map = contentWindow.umMap;

                    const marker = markers.find((m) =>
                      m.getTitle()!.startsWith(player.name)
                    );

                    map.panTo(marker!.getPosition() as google.maps.LatLng);
                    map.setZoom(16);
                  } catch (error) {
                    console.error(error);
                  }
                }}
                sx={{
                  height: "auto",
                  "& .MuiChip-label": {
                    display: "block",
                    whiteSpace: "normal",
                  },
                }}
                key={player.name}
              />
            );
          })}
      </Stack>
      <Box
        sx={{
          height: "100%",
        }}
      >
        <Iframe
          onLoad={() => setIsFrameLoaded(true)}
          id="frame"
          url="/frame"
          width="100%"
          height="100%"
        ></Iframe>
      </Box>
    </Stack>
  );
}
