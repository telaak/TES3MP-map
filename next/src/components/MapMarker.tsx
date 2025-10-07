/**
 * MapMarker
 * Renders and animates a Leaflet marker for a single TES3MP player.
 *
 * Responsibilities:
 *  - Create a marker with the player's head icon (head+hair composite PNG).
 *  - Bind a permanent tooltip showing the player's name.
 *  - Animate movement smoothly when the player's location updates.
 *  - Clean up the marker on unmount to avoid map clutter / memory leaks.
 *
 * The component returns an empty fragment because the visual representation lives
 * entirely in the Leaflet map outside of React's DOM tree.
 */
import {
  getLeafletFrame,
  LeafletAnimatedMarker,
  leafletAnimateMarkerTo,
} from "@/app/(leaflet)/iframe";
import { getCoords } from "@/functions";
import { Player } from "@/types";
import { useEffect, useRef } from "react";

export interface MapMarkerProps {
  /** Player entity whose position and appearance drive the marker */
  player: Player;
}

export default function MapMarker({ player }: MapMarkerProps) {
  // Keep an imperative ref to the Leaflet marker so we can animate position updates.
  const markerRef = useRef<L.Marker>(null);

  // Initial mount: create and add the Leaflet marker + tooltip.
  useEffect(() => {
    const leafletFrame = getLeafletFrame();
    const gamemap = leafletFrame.contentWindow.gamemap;
    const L = leafletFrame.contentWindow.L;

    // Convert player world/cell data into map coordinates.
    const playerCoords = getCoords(player);

    // Use a pre-generated composite head icon (50x50) for clarity.
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

    // Cleanup on unmount: remove marker from the map.
    return () => {
      marker.remove();
    };
  }, []); // Intentionally run once: marker identity tied to initial player object.

  // Animate marker when player location changes.
  useEffect(() => {
    if (markerRef.current) {
      const coords = getCoords(player);
      leafletAnimateMarkerTo(
        markerRef.current as LeafletAnimatedMarker,
        coords
      );
    }
  }, [player.location]);

  // No DOM output; all side-effects occur in Leaflet layer space.
  return <></>;
}
