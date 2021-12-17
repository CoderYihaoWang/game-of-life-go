import { Options } from "./Game";
import {
  Box,
  Button,
  Dialog,
  Divider,
  FormControlLabel,
  Grid,
  Slider,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

export default function Modal({
  isOpen,
  onClose,
  options,
  setOptions,
}: {
  isOpen: boolean;
  onClose: () => void;
  options: Options;
  setOptions: (_: Options) => void;
}) {
  const [minSize, maxSize] = [3, 20];
  const [minSeedingRounds, maxSeedingRounds] = [1, 4];
  const [minUndos, maxUndos] = [0, 6];

  const [size, setSize] = useState<number>(options.size);
  const [seedingRounds, setSeedingRounds] = useState<number>(
    options.seedingRounds
  );
  const [undos, setUndos] = useState<number | undefined>(options.undos);
  const [wrapAtBoundary, setWrapAtBoundary] = useState<boolean>(
    options.wrapAtBoundary
  );
  const [showHints, setShowHints] = useState<boolean>(options.showHints);

  const handleSizeChange = (e: Event, value: number | number[]) =>
    setSize(value as number);
  const handleSeedingRoundsChange = (e: Event, value: number | number[]) =>
    setSeedingRounds(value as number);
  const handleUndosChange = (e: Event, value: number | number[]) =>
    setUndos(value === maxUndos ? undefined : (value as number));
  const handleWrapAtBoundaryChange = (
    e: React.SyntheticEvent,
    checked: boolean
  ) => setWrapAtBoundary(checked);
  const handleShowHintsChange = (e: React.SyntheticEvent, checked: boolean) =>
    setShowHints(checked);

  const handleStart = () => {
    setOptions({
      size,
      seedingRounds,
      undos: undos,
      wrapAtBoundary: wrapAtBoundary,
      showHints,
    });
    onClose();
  };

  const revertsLabelDisplay: (_: number) => number | string = (x) =>
    x === maxUndos ? "Unlimited" : x;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ elevation: 12, square: true }}
    >
      <Box sx={{ padding: "2em" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              fontSize="2em"
              textAlign="center"
              sx={{ color: "primary.main" }}
            >
              Set New Game
            </Typography>
          </Grid>
          <Grid item xs={12} margin="1em 0">
            <Divider />
          </Grid>
          <Grid item xs={9}>
            <Slider
              value={size}
              onChange={handleSizeChange}
              min={minSize}
              max={maxSize}
              marks
              valueLabelDisplay="on"
              size="small"
            />
          </Grid>
          <Grid item xs={3}>
            <Tooltip title="Size of the game board">
              <Typography fontSize="0.8em">Board Size</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={9}>
            <Slider
              value={seedingRounds}
              onChange={handleSeedingRoundsChange}
              min={minSeedingRounds}
              max={maxSeedingRounds}
              marks
              valueLabelDisplay="on"
              size="small"
            />
          </Grid>
          <Grid item xs={3}>
            <Tooltip title="Number of seeding rounds. The Game of Life calculation rules apply only after the seeding rounds.">
              <Typography fontSize="0.8em">Seeding Rounds</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={9}>
            <Slider
              value={undos ?? maxUndos}
              onChange={handleUndosChange}
              min={minUndos}
              max={maxUndos}
              valueLabelFormat={revertsLabelDisplay}
              marks
              valueLabelDisplay="on"
              size="small"
            />
          </Grid>
          <Grid item xs={3}>
            <Tooltip title="Number of undo chances for each player">
              <Typography fontSize="0.8em">Undo Chances</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="When checked, the left boundary of the board is treated as being connected with the right boundary, same for the upper and lower boundaries">
              <FormControlLabel
                checked={wrapAtBoundary}
                label="Wrap at Boundary"
                labelPlacement="end"
                onChange={handleWrapAtBoundaryChange}
                control={<Switch />}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="When checked, the players can see the status of cells in the next round before actually making the move">
              <FormControlLabel
                checked={showHints}
                label="Show Hints"
                labelPlacement="end"
                onChange={handleShowHintsChange}
                control={<Switch />}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} margin="1em 0">
            <Divider />
          </Grid>
          <Grid item padding="2em 0 0 0" xs={12}>
            <Button
              onClick={handleStart}
              variant="contained"
              style={{ borderRadius: 0, boxShadow: "0 0", color: "white" }}
              size="large"
            >
              Start
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
}
