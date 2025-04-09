"use client";
import Iframe from "react-iframe";
import { AnimatedMarker, animateMarkerTo, getFrame } from "./MwMapIframe";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Player } from "./players/route";
import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import StatBar from "@/components/StatBar";

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
        height: "calc(100dvh)",
        width: "100dvw",
      }}
    >
      <Box
        sx={{
          height: "100%",
        }}
      >
        <Box
          sx={{
            position: "absolute",
          }}
        >
          <Stack
            style={{
              padding: "1em",
            }}
            direction="row"
            columnGap={2}
            rowGap={2}
            flexWrap="wrap"
          >
            {players.data &&
              players.data.map((player) => {
                return (
                  <Chip
                    key={player.name}
                    label={
                      <>
                        <Stack direction="column" spacing={0.5}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h6">{player.name}</Typography>
                            <Typography variant="body1">
                              {player.stats.level}
                            </Typography>
                          </Stack>

                          <Divider sx={{ borderBottomWidth: 2 }} />
                          <Typography variant="body2">
                            {player.location.regionName || player.location.cell}
                          </Typography>
                          <Divider sx={{ borderBottomWidth: 2 }} />
                          <StatBar
                            color="error"
                            baseStat={player.stats.baseHealth}
                            currentStat={player.stats.currentHealth}
                          />
                          <StatBar
                            color="info"
                            baseStat={player.stats.baseMagicka}
                            currentStat={player.stats.currentMagicka}
                          />
                          <StatBar
                            color="success"
                            baseStat={player.stats.baseFatigue}
                            currentStat={player.stats.currentFatigue}
                          />
                        </Stack>
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
                      background: "rgba(0,0,0,0.5)",
                      height: "auto",
                      "& .MuiChip-label": {
                        display: "block",
                        whiteSpace: "normal",
                      },
                      paddingBottom: "1em",
                      paddingTop: "0.5em",
                    }}
                  />
                );
              })}
          </Stack>
        </Box>
        <Iframe
          onLoad={() => setIsFrameLoaded(true)}
          styles={{
            border: "none",
            margin: 0,
            padding: 0,
          }}
          id="frame"
          url="/frame"
          width="100%"
          height="100%"
        ></Iframe>
      </Box>
    </Stack>
  );
}
