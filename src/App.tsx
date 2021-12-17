import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Board from "./Board";
import { Options, Game, Player } from "./Game";
import Modal from "./Modal";

export default function App() {
  const [options, setOptions] = useState<Options>({
    size: 9,
    seedingRounds: 2,
    undos: 3,
    wrapAtBoundary: false,
    showHints: false,
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPlayingBack, setIsPlayingBack] = useState<boolean>(false);
  const [game, setGame] = useState<Game>(new Game(options));

  useEffect(() => {
    setGame(new Game(options));
  }, [options]);

  const playerColor = () =>
    game.winner !== Player.None
      ? game.winner === Player.Player1
        ? "player1.main"
        : game.winner === Player.Player2
        ? "player2.main"
        : "primary.main"
      : game.player === Player.Player1
      ? "player1.main"
      : "player2.main";

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleUndo = () => setGame(game.undo());

  const handlePlayback = () => {
    setIsPlayingBack(true);

    const history = game.history;
    let i = 0;
    for (; i < history.length; i++) {
      setTimeout(
        ((i: number) => () => {
          game.board = history[i];
          setGame(Object.create(game));
        })(i),
        500 * i
      );
    }

    setTimeout(() => {
      setIsPlayingBack(false);
    }, 500 * i);
  };

  return (
    <Container maxWidth="xs">
      <Grid container>
        <Grid
          container
          item
          xs={12}
          sx={{ backgroundColor: "primary.main", margin: "3em 0 2em 0" }}
        >
          <Grid item xs={6}>
            <Typography
              textAlign="left"
              fontSize="3em"
              color="white"
              paddingLeft="1em"
            >
              <Box
                sx={{
                  display: "inline-block",
                  width: "0.8em",
                  height: "0.8em",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  boxShadow: "5px 5px",
                  color: playerColor(),
                  verticalAlign: "baseline",
                }}
              ></Box>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography
              textAlign="right"
              fontSize="3em"
              color="white"
              paddingRight="1em"
            >
              {game.winner === Player.Draw
                ? "Draw"
                : game.winner !== Player.None
                ? "Wins!"
                : `#${game.move}`}
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Board game={game} setGame={setGame} />
        </Grid>
        <Grid item xs={4} textAlign="center" padding="2em 0">
          <Button
            disabled={!game.canUndo() || isPlayingBack}
            onClick={handleUndo}
            variant="contained"
            style={{ borderRadius: 0, boxShadow: "0 0", color: "white" }}
            size="large"
          >
            {`Undo${game.undos > 0 ? `(${game.undos})` : ""}`}
          </Button>
        </Grid>
        <Grid item xs={4} textAlign="center" padding="2em 0">
          <Button
            disabled={isPlayingBack}
            onClick={handleModalOpen}
            variant="contained"
            style={{ borderRadius: 0, boxShadow: "0 0", color: "white" }}
            size="large"
          >
            New Game
          </Button>
        </Grid>
        <Grid item xs={4} textAlign="center" padding="2em 0">
          <Button
            disabled={game.winner === Player.None || isPlayingBack}
            onClick={handlePlayback}
            variant="contained"
            style={{ borderRadius: 0, boxShadow: "0 0", color: "white" }}
            size="large"
          >
            Playback
          </Button>
        </Grid>
      </Grid>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        options={options}
        setOptions={setOptions}
      />
    </Container>
  );
}
