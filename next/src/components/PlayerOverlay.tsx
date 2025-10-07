/**
 * PlayerOverlay
 * Displays a responsive overlay of all active players with quick-glance stats and map jump buttons.
 * Each player is rendered as a Material UI Chip containing:
 *  - Name & level header
 *  - Region/cell jump button (centers map on click)
 *  - Three StatBar components for Health, Magicka, Fatigue
 * Layout wraps across rows using a flex Stack for responsiveness.
 */
import { Box, Stack, Chip, Typography, Divider, Button } from "@mui/material";
import StatBar from "./StatBar";
import { Player } from "@/types";
import { getCoords, setView, usePlayerQuery } from "@/functions";

export default function PlayerOverlay() {
  const players = usePlayerQuery();

  return (
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
          players.data.map((player: Player) => {
            return (
              <Chip
                key={player.name}
                label={
                  <Stack
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      rowGap: 0.5,
                      height: "100%",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6">{player.name}</Typography>
                      <Typography variant="body1">
                        {player.stats.level}
                      </Typography>
                    </Stack>

                    <Divider sx={{ borderBottomWidth: 2 }} />
                    <Button
                      sx={{
                        flexGrow: 1,
                      }}
                      color="inherit"
                      variant="contained"
                      onClick={() => {
                        const coords = getCoords(player);
                        setView(coords, 16);
                      }}
                    >
                      <Typography variant="body2">
                        {player.location.regionName || player.location.cell}
                      </Typography>
                    </Button>

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
                }
                sx={{
                  background: "rgba(0,0,0,0.5)",
                  height: "auto",
                  "& .MuiChip-label": {
                    whiteSpace: "normal",
                    height: "100%",
                  },
                  paddingBottom: "1em",
                  paddingTop: "0.5em",
                  maxWidth: "15em",
                }}
              />
            );
          })}
      </Stack>
    </Box>
  );
}
