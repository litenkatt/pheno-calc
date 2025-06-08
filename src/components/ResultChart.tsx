import { Box, Typography, useTheme } from "@mui/material";

export const ResultChart = ({ accel }: { accel: number }) => {
  const theme = useTheme();

  const range = 15; // years on each side
  const clamped = Math.max(-range, Math.min(range, accel));
  const percent = ((clamped + range) / (2 * range)) * 100;

  const color =
    clamped >= 0 ? theme.palette.error.main : theme.palette.primary.main;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography align="center" variant="h6">
        You are {Math.abs(clamped).toFixed(1)} years{" "}
        {clamped < 0 ? "younger" : "older"} than your chronological age
      </Typography>

      <Box
        sx={{
          position: "relative",
          height: 20,
          background: theme.palette.grey[300],
          borderRadius: 10,
          mt: 2,
          overflow: "hidden",
        }}
      >
        {/* Center line (your age) */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: theme.palette.primary.main,
            zIndex: 1,
          }}
        />

        {/* Acceleration bar */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: clamped >= 0 ? "50%" : `${percent}%`,
            right: clamped < 0 ? "50%" : `${100 - percent}%`,
            bgcolor: color,
            transition: "all 0.3s ease",
            zIndex: 0,
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          mt: 1,
        }}
      >
        <span>{`−${range}y`}</span>
        <span>{`+${range}y`}</span>
      </Box>
    </Box>
  );
};
