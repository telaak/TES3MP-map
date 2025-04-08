"use client";
import Iframe from "react-iframe";
import { AnimatedMarker, animateMarkerTo, getFrame } from "./MwMapIframe";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Player } from "./map/route";

export default function Home() {
  const locations = useQuery({
    queryKey: ["locations"],
    queryFn: () => fetch("/map").then((res) => res.json()) as Promise<Player[]>,
    refetchInterval: 250,
  });

  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const [isFrameLoaded, setIsFrameLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (locations.data && isFrameLoaded) {
      const contentWindow = getFrame().contentWindow;
      const frameGoogle = contentWindow.google;
      const map = contentWindow.umMap;

      for (const player of locations.data) {
        const marker = markers.find((m) => m.getTitle() === player.name);
        if (marker) {
          if (player.location.regionName.length > 0) {
            animateMarkerTo(
              marker as AnimatedMarker,
              contentWindow.umConvertLocToLatLng(
                player.location.posX,
                player.location.posY
              )
            );
          }
        } else {
          const newMarker = new frameGoogle.maps.Marker({
            title: player.name,
            position: contentWindow.umConvertLocToLatLng(
              player.location.posX,
              player.location.posY
            ),
            map,
          });
          setMarkers([...markers, newMarker]);
        }
      }
    }
  }, [locations.data, isFrameLoaded]);

  return (
    <div
      style={{
        height: "100dvh",
        width: "100dvw",
      }}
    >
      <Iframe
        onLoad={() => setIsFrameLoaded(true)}
        id="frame"
        url="/frame"
        width="100%"
        height="100%"
      ></Iframe>
    </div>
  );
}
