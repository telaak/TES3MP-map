"use client";
import Iframe from "react-iframe";
import { AnimatedMarker, animateMarkerTo, getGoogleFrame } from "./iframe";
import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import PlayerOverlay from "@/components/PlayerOverlay";
import { usePlayerQuery } from "@/functions";

export default function Home() {
  const players = usePlayerQuery();

  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const [isFrameLoaded, setIsFrameLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (players.data && isFrameLoaded) {
      const contentWindow = getGoogleFrame().contentWindow;
      const frameGoogle = contentWindow.google;
      const map = contentWindow.umMap;

      for (const marker of markers) {
        const foundPlayer = players.data.find((p) =>
          (marker.getTitle() as string).startsWith(p.name)
        );

        if (!foundPlayer) {
          marker.setMap(null);
          setMarkers(markers.filter((m) => m !== marker));
        }
      }

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
              try {
                const contentWindow = getGoogleFrame().contentWindow;
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
          url="/google-frame"
          width="100%"
          height="100%"
        ></Iframe>
      </Box>
    </Stack>
  );
}
