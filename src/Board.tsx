import { Box } from "@mui/material";
import { CellStatus, Game, Player } from "./Game";

function colorOf(status: CellStatus, showHints: boolean): string {
  if (showHints) {
    switch (status) {
      case CellStatus.Player1:
        return "player1.light";
      case CellStatus.Player1Dying:
        return "player1.dark";
      case CellStatus.Player2:
        return "player2.light";
      case CellStatus.Player2Dying:
        return "player2.dark";
    }
    return "white";
  }
  switch (status) {
    case CellStatus.Player1:
    case CellStatus.Player1Dying:
      return "player1.light";
    case CellStatus.Player2:
    case CellStatus.Player2Dying:
      return "player2.light";
  }
  return "white";
}

function shadowOf(status: CellStatus, showHints: boolean): string {
  if (showHints) {
    switch (status) {
      case CellStatus.Player1:
      case CellStatus.Player1Reviving:
        return "player1.main";
      case CellStatus.Player2:
      case CellStatus.Player2Reviving:
        return "player2.main";
    }
    return "primary.main";
  }
  switch (status) {
    case CellStatus.Player1:
    case CellStatus.Player1Dying:
      return "player1.main";
    case CellStatus.Player2:
    case CellStatus.Player2Dying:
      return "player2.main";
  }
  return "primary.main";
}

export default function Board({
  game,
  setGame,
}: {
  game: Game;
  setGame: (_: Game) => void;
}) {
  const cellSize = `${100 / game.options.size}%`;

  const hasGameEnded = () => game.winner !== Player.None;

  const handleClick = (r: number, c: number) => () => {
    if (!hasGameEnded()) {
      setGame(game.commit(r, c));
    }
  };

  const handleMouseOver = (r: number, c: number) => () => {
    if (!hasGameEnded()) {
      setGame(game.put(r, c, game.player));
    }
  };

  const handleMouseOut = () => {
    if (!hasGameEnded()) {
      setGame(game.unput());
    }
  };

  return (
    <Box>
      {game.board.map((row, r) => (
        <Box sx={{ display: "flex" }}>
          {row.map((cell, c) => (
            <Box
              sx={{
                display: "block",
                width: cellSize,
                paddingBottom: cellSize,
                backgroundColor: colorOf(cell, game.options.showHints),
                borderRadius: "50%",
                boxShadow: "5px 5px",
                color: shadowOf(cell, game.options.showHints),
              }}
              onClick={handleClick(r, c)}
              onMouseOver={handleMouseOver(r, c)}
              onMouseOut={handleMouseOut}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}
