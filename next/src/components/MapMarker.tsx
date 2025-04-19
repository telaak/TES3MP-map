import {
  getLeafletFrame,
  LeafletAnimatedMarker,
  leafletAnimateMarkerTo,
} from "@/app/(leaflet)/iframe";
import { getCoords } from "@/functions";
import { Player } from "@/types";
import { useEffect, useRef } from "react";

export default function MapMarker({ player }: { player: Player }) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    const leafletFrame = getLeafletFrame();
    const gamemap = leafletFrame.contentWindow.gamemap;
    const L = leafletFrame.contentWindow.L;

    const playerCoords = getCoords(player);

    const headIcon = L.icon({
      iconUrl: `/head/${player.head}-${player.hair}.png`,
      iconSize: [50, 50],
    });

    const marker = L.marker(playerCoords, {
      icon: headIcon,
      title: `${player.name}`,
    });

    marker.addTo(gamemap.getMap());

    marker.bindTooltip(player.name, {
      direction: "top",
      offset: new L.Point(0, -15),
      permanent: true,
    });

    markerRef.current = marker;

    return () => {
      marker.remove();
    };
  }, []);

  useEffect(() => {
    if (markerRef.current) {
      const coords = getCoords(player);
      leafletAnimateMarkerTo(
        markerRef.current as LeafletAnimatedMarker,
        coords
      );
    }
  }, [player.location]);

  return <></>;
}
