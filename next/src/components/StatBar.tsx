import { LinearProgress, Tooltip } from "@mui/material";

export type StatBarProps = {
  currentStat: number;
  baseStat: number;
  color: "error" | "success" | "info";
};

export default function StatBar(props: StatBarProps) {
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
