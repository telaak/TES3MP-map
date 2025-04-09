import { Box, Stack, Chip, Typography, Divider } from "@mui/material";
import StatBar from "./StatBar";
import { Player } from "@/app/players/route";

export type PlayerOverlayProps = {
  players: Player[];
  onClick: (player: Player) => void;
};

export default function PlayerOverlay(props: PlayerOverlayProps) {
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
        {props.players.map((player) => {
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
              onClick={(e) => props.onClick(player)}
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
  );
}
