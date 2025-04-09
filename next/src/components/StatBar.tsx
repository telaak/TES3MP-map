import { LinearProgress, Tooltip } from "@mui/material";

export type StatBarProps = {
  currentStat: number;
  baseStat: number;
  color: "error" | "success" | "info";
};

export default function StatBar(props: StatBarProps) {
  return (
    <Tooltip
      placement="right-start"
      title={`${props.currentStat.toFixed(0)}/${props.baseStat}`}
    >
      <LinearProgress
        variant="determinate"
        value={(props.currentStat / props.baseStat) * 100}
        color={props.color}
        sx={{
          padding: "0.5em",
        }}
      />
    </Tooltip>
  );
}
