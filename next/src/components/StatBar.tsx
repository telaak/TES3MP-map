/**
 * StatBar
 * Visualizes a player stat (health, magicka, fatigue) as a determinate Material UI linear progress bar.
 * Shows a tooltip with the exact numeric current/base values.
 */
import { LinearProgress, Tooltip } from "@mui/material";

export interface StatBarProps {
  /** Current (possibly fluctuating) value of the stat */
  currentStat: number;
  /** Base (maximum or reference) value of the stat */
  baseStat: number;
  /** Color channel to distinguish stat type visually */
  color: "error" | "success" | "info";
}

export default function StatBar(props: StatBarProps) {
  // Round current stat to avoid fractional noise in display & tooltip.
  const roundedCurrent = Math.round(props.currentStat);

  return (
    <Tooltip
      placement="right-start"
      title={`${roundedCurrent}/${props.baseStat}`}
    >
      <LinearProgress
        variant="determinate"
        value={(roundedCurrent / props.baseStat) * 100}
        color={props.color}
        sx={{
          padding: "0.5em",
        }}
      />
    </Tooltip>
  );
}
