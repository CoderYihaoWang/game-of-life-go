export type Options = {
  size: number,
  seedingRounds: number,
  undos: number | undefined,
  wrapAtBoundary: boolean,
  showHints: boolean
}

export enum CellStatus {
  None,
  Player1,
  Player1Dying,
  Player1Reviving,
  Player2,
  Player2Dying,
  Player2Reviving
}

function isPlayer1(status: CellStatus): boolean {
  return status === CellStatus.Player1
    || status === CellStatus.Player1Dying;
}

function isPlayer2(status: CellStatus): boolean {
  return status === CellStatus.Player2
    || status === CellStatus.Player2Dying;
}

function nextStatus(status: CellStatus, player1Neighbors: number, player2Neighbors: number): CellStatus {
  const neighbors = player1Neighbors + player2Neighbors;

  if (isPlayer1(status)) {
    if (neighbors < 2 || neighbors > 3) return CellStatus.Player1Dying;
    return CellStatus.Player1;
  }

  if (isPlayer2(status)) {
    if (neighbors < 2 || neighbors > 3) return CellStatus.Player2Dying;
    return CellStatus.Player2;
  }

  if (neighbors !== 3) return CellStatus.None;

  if (player1Neighbors > player2Neighbors)
    return CellStatus.Player1Reviving;

  return CellStatus.Player2Reviving;
}

function applyStatusChange(status: CellStatus): CellStatus {
  if (status === CellStatus.Player1Dying
    || status === CellStatus.Player2Dying)
    return CellStatus.None;
  if (status === CellStatus.Player1Reviving) return CellStatus.Player1;
  if (status === CellStatus.Player2Reviving) return CellStatus.Player2;
  return status;
}

export enum Player {
  None,
  Player1,
  Player2,
  Draw
}

function playerOf(cellStatus: CellStatus): Player {
  if (isPlayer1(cellStatus)) return Player.Player1;
  if (isPlayer2(cellStatus)) return Player.Player2;
  return Player.None;
}

function cellStatusOf(player: Player): CellStatus {
  if (player === Player.Player1) return CellStatus.Player1;
  if (player === Player.Player2) return CellStatus.Player2;
  return CellStatus.None;
}

function opponentOf(player: Player): Player {
  return player === Player.Player1 ? Player.Player2 : Player.Player1;
}

export class Game {
  private _options: Options;
  private _board: CellStatus[][];
  private _player: Player;
  private _move: number;
  private _winner: Player;
  private _history: CellStatus[][][];
  private _undos: Map<Player, number | undefined>;
  private _hasUndoApplied: boolean;
  private _tempR: number | undefined;
  private _tempC: number | undefined;
  private _tempPlayer: Player;

  constructor(options: Options) {
    this._options = options;
    this._player = Player.Player1;
    this._move = 1;
    this._winner = Player.None;
    this._board = this.newBoard();
    this._history = [this.cloneBoard(this._board)];
    this._undos = new Map<Player, number>();
    this._undos.set(Player.Player1, options.undos);
    this._undos.set(Player.Player2, options.undos);
    this._hasUndoApplied = false;
    [this._tempR, this._tempC, this._tempPlayer] = [undefined, undefined, Player.None];
  }

  set board(board: CellStatus[][]) {
    this._board = board;
  }

  get board() {
    return this._board;
  }

  get options() {
    return { ...this._options };
  }

  get history() {
    return [...this._history];
  }

  get move() {
    return this._move;
  }

  get undos(): number {
    return this._undos.get(this._player)!;
  }

  get player(): Player {
    return this._player;
  }

  get winner(): Player {
    return this._winner;
  }

  canPut(r: number, c: number): boolean {
    return !isPlayer1(this._board[r][c]) && !isPlayer2(this._board[r][c]);
  }

  put(r: number, c: number, player: Player): Game {
    if (!this.canPut(r, c)) {
      return this;
    }

    if (this._tempR !== undefined) {
      this.unput();
    }

    [this._tempR, this._tempC, this._tempPlayer] = [r, c, playerOf(this._board[r][c])];
    this._board[r][c] = cellStatusOf(player);

    if (!this.isSeeding()) {
      this.compute();
    }

    return Object.create(this);
  }

  unput(): Game {
    if (this._tempR === undefined || this._tempC === undefined) {
      return this;
    }

    const [r, c, player] = [this._tempR, this._tempC, this._tempPlayer];
    [this._tempR, this._tempC, this._tempPlayer] = [undefined, undefined, Player.None];
    this._board[r][c] = cellStatusOf(player);

    if (!this.isSeeding()) {
      this.compute();
    }

    return Object.create(this);
  }

  commit(r: number, c: number): Game {
    if (this.canPut(r, c)) {
      this.put(r, c, this._player);
    }

    if (this._tempR !== r || this._tempC !== c) {
      return this;
    }

    this._hasUndoApplied = false;
    this._player = opponentOf(this._player);
    [this._tempR, this._tempC, this._tempPlayer] = [undefined, undefined, Player.None];

    if (!this.isSeeding()) {
      this.moveNext();
      this.compute();
      this.setWinner();
    }

    this._move++;

    this._history.push(this.cloneBoard(this._board));

    return Object.create(this);
  }

  canUndo(): boolean {
    return !this._hasUndoApplied
      && this._winner === Player.None
      && this._move >= 3
      && (this.undos === undefined || this.undos > 0);
  }

  undo(): Game {
    if (!this.canUndo()) {
      return this;
    }
    if (this.undos !== undefined) {
      this._undos.set(this._player, this.undos - 1);
    }
    this._hasUndoApplied = true;
    this._move -= 2;
    this._history.pop();
    this._history.pop();
    const top = this._history.pop()!;
    this._board = this.cloneBoard(top);
    this._history.push(top);

    if (!this.isSeeding()) {
      this.setWinner();
    }

    return Object.create(this);
  }

  private setWinner() {
    let hasPlayer1 = false;
    let hasPlayer2 = false;
    for (let i = 0; i < this._options.size; i++) {
      for (let j = 0; j < this._options.size; j++) {
        if (isPlayer1(this._board[i][j])) {
          hasPlayer1 = true;
        } else if (isPlayer2(this._board[i][j])) {
          hasPlayer2 = true;
        }
      }
    }
    switch (true) {
      case !hasPlayer1 && !hasPlayer2:
        this._winner = Player.Draw;
        return;
      case !hasPlayer2:
        this._winner = Player.Player1;
        return;
      case !hasPlayer1:
        this._winner = Player.Player2;
        return;
      default:
        this._winner = Player.None;
    }
  }

  private compute() {
    const newBoard = this.newBoard();
    for (let i = 0; i < this._options.size; i++) {
      for (let j = 0; j < this._options.size; j++) {
        const player1Neighbors = this.neighbors(i, j, isPlayer1);
        const player2Neighbors = this.neighbors(i, j, isPlayer2);
        newBoard[i][j] = nextStatus(this._board[i][j], player1Neighbors, player2Neighbors);
      }
    }
    this._board = newBoard;
  }

  private moveNext() {
    const newBoard = this.newBoard();
    for (let i = 0; i < this._options.size; i++) {
      for (let j = 0; j < this._options.size; j++) {
        const player1Neighbors = this.neighbors(i, j, isPlayer1);
        const player2Neighbors = this.neighbors(i, j, isPlayer2);
        const next = nextStatus(this._board[i][j], player1Neighbors, player2Neighbors);
        newBoard[i][j] = applyStatusChange(next);
      }
    }
    this._board = newBoard;
  }

  private neighbors(r: number, c: number, isPlayer: (_: CellStatus) => boolean): number {
    let count = 0;
    if (isPlayer(this.cellAt(r - 1, c))) count++;
    if (isPlayer(this.cellAt(r + 1, c))) count++;
    if (isPlayer(this.cellAt(r - 1, c - 1))) count++;
    if (isPlayer(this.cellAt(r + 1, c - 1))) count++;
    if (isPlayer(this.cellAt(r, c - 1))) count++;
    if (isPlayer(this.cellAt(r - 1, c + 1))) count++;
    if (isPlayer(this.cellAt(r + 1, c + 1))) count++;
    if (isPlayer(this.cellAt(r, c + 1))) count++;
    return count;
  }

  private cellAt(r: number, c: number): CellStatus {
    if (this._options.wrapAtBoundary) {
      r = (r + this._board.length) % this._board.length;
      c = (c + this._board[0].length) % this._board[0].length;
    }
    if (r < 0 || r >= this._board.length || c < 0 || c >= this._board.length) {
      return CellStatus.None;
    }
    return this._board[r][c];
  }

  private isSeeding(): boolean {
    return this._options.seedingRounds * 2 >= this._move;
  }

  private newBoard(): CellStatus[][] {
    const board = new Array<CellStatus[]>(this._options.size);
    for (let i = 0; i < this._options.size; i++) {
      board[i] = new Array<CellStatus>(this._options.size).fill(CellStatus.None);
    }
    return board;
  }

  private cloneBoard(board: CellStatus[][]) {
    const clone = new Array<CellStatus[]>(this._options.size);
    for (let i = 0; i < this._options.size; i++) {
      clone[i] = [...board[i]]
    }
    return clone;
  }
}