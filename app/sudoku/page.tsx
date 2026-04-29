"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eraser,
  Lightbulb,
  RotateCcw,
  Shuffle,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Board = number[][];
type Difficulty = "easy" | "medium" | "hard";
type CellPosition = {
  row: number;
  col: number;
};
type GameStatus = "playing" | "solved";
type DisplayStatus = GameStatus | "complete";

const SIZE = 9;
const BOX = 3;
const EMPTY = 0;

const DIFFICULTIES: Record<
  Difficulty,
  {
    label: string;
    clues: number;
  }
> = {
  easy: {
    label: "Easy",
    clues: 42,
  },
  medium: {
    label: "Medium",
    clues: 36,
  },
  hard: {
    label: "Hard",
    clues: 30,
  },
};

const DEFAULT_SOLUTION: Board = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

const DEFAULT_PUZZLE: Board = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[nextIndex]] = [
      shuffled[nextIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function buildShuffledIndexes(): number[] {
  return shuffle([0, 1, 2]).flatMap((box) =>
    shuffle([0, 1, 2]).map((offset) => box * BOX + offset),
  );
}

function generateSolution(): Board {
  const rows = buildShuffledIndexes();
  const cols = buildShuffledIndexes();
  const values = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  return rows.map((row) =>
    cols.map((col) => values[(row * BOX + Math.floor(row / BOX) + col) % SIZE]),
  );
}

function canPlace(board: Board, row: number, col: number, value: number): boolean {
  for (let index = 0; index < SIZE; index += 1) {
    if (board[row][index] === value || board[index][col] === value) {
      return false;
    }
  }

  const startRow = Math.floor(row / BOX) * BOX;
  const startCol = Math.floor(col / BOX) * BOX;

  for (let rowOffset = 0; rowOffset < BOX; rowOffset += 1) {
    for (let colOffset = 0; colOffset < BOX; colOffset += 1) {
      if (board[startRow + rowOffset][startCol + colOffset] === value) {
        return false;
      }
    }
  }

  return true;
}

function getCandidates(board: Board, row: number, col: number): number[] {
  if (board[row][col] !== EMPTY) {
    return [];
  }

  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((value) =>
    canPlace(board, row, col, value),
  );
}

function findBestEmptyCell(
  board: Board,
): (CellPosition & { candidates: number[] }) | null {
  let bestCell: (CellPosition & { candidates: number[] }) | null = null;

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] === EMPTY) {
        const candidates = getCandidates(board, row, col);

        if (candidates.length === 0) {
          return {
            row,
            col,
            candidates,
          };
        }

        if (!bestCell || candidates.length < bestCell.candidates.length) {
          bestCell = {
            row,
            col,
            candidates,
          };
        }
      }
    }
  }

  return bestCell;
}

function countSolutions(board: Board, limit = 2): number {
  const nextCell = findBestEmptyCell(board);

  if (!nextCell) {
    return 1;
  }

  if (nextCell.candidates.length === 0) {
    return 0;
  }

  let count = 0;

  for (const value of nextCell.candidates) {
    board[nextCell.row][nextCell.col] = value;
    count += countSolutions(board, limit);
    board[nextCell.row][nextCell.col] = EMPTY;

    if (count >= limit) {
      return count;
    }
  }

  return count;
}

function createPuzzle(solution: Board, clueTarget: number): Board {
  const puzzle = cloneBoard(solution);
  const cells = shuffle(Array.from({ length: SIZE * SIZE }, (_, index) => index));
  let clues = SIZE * SIZE;

  for (const cell of cells) {
    if (clues <= clueTarget) {
      break;
    }

    const mirror = SIZE * SIZE - 1 - cell;
    const positions = Array.from(new Set([cell, mirror]));
    const removedValues = positions.map((position) => {
      const row = Math.floor(position / SIZE);
      const col = position % SIZE;

      return {
        row,
        col,
        value: puzzle[row][col],
      };
    });

    if (removedValues.every(({ value }) => value === EMPTY)) {
      continue;
    }

    for (const { row, col } of removedValues) {
      puzzle[row][col] = EMPTY;
    }

    if (countSolutions(cloneBoard(puzzle)) === 1) {
      clues -= removedValues.filter(({ value }) => value !== EMPTY).length;
    } else {
      for (const { row, col, value } of removedValues) {
        puzzle[row][col] = value;
      }
    }
  }

  return puzzle;
}

function createGame(difficulty: Difficulty): {
  puzzle: Board;
  solution: Board;
} {
  const solution = generateSolution();
  const puzzle = createPuzzle(solution, DIFFICULTIES[difficulty].clues);

  return {
    puzzle,
    solution,
  };
}

function getGivenCells(puzzle: Board): boolean[][] {
  return puzzle.map((row) => row.map((cell) => cell !== EMPTY));
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function isSameBox(a: CellPosition, b: CellPosition): boolean {
  return (
    Math.floor(a.row / BOX) === Math.floor(b.row / BOX) &&
    Math.floor(a.col / BOX) === Math.floor(b.col / BOX)
  );
}

function isBoardComplete(board: Board, solution: Board): boolean {
  return board.every((row, rowIndex) =>
    row.every((cell, colIndex) => cell === solution[rowIndex][colIndex]),
  );
}

export default function Page() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [puzzle, setPuzzle] = useState<Board>(DEFAULT_PUZZLE);
  const [solution, setSolution] = useState<Board>(DEFAULT_SOLUTION);
  const [board, setBoard] = useState<Board>(DEFAULT_PUZZLE);
  const [givenCells, setGivenCells] = useState<boolean[][]>(
    getGivenCells(DEFAULT_PUZZLE),
  );
  const [selectedCell, setSelectedCell] = useState<CellPosition>({
    row: 0,
    col: 0,
  });
  const [mistakes, setMistakes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");

  const filledCells = useMemo(
    () => board.flat().filter((cell) => cell !== EMPTY).length,
    [board],
  );

  const isComplete = useMemo(
    () => isBoardComplete(board, solution),
    [board, solution],
  );

  const displayStatus: DisplayStatus =
    status === "solved" ? "solved" : isComplete ? "complete" : "playing";

  const selectedValue = board[selectedCell.row][selectedCell.col];

  const remainingByValue = useMemo(
    () =>
      Array.from({ length: SIZE }, (_, index) => {
        const value = index + 1;
        const used = board.flat().filter((cell) => cell === value).length;

        return Math.max(0, SIZE - used);
      }),
    [board],
  );

  const startGame = useCallback((nextDifficulty: Difficulty) => {
    const nextGame = createGame(nextDifficulty);

    setDifficulty(nextDifficulty);
    setPuzzle(nextGame.puzzle);
    setSolution(nextGame.solution);
    setBoard(cloneBoard(nextGame.puzzle));
    setGivenCells(getGivenCells(nextGame.puzzle));
    setSelectedCell({
      row: 0,
      col: 0,
    });
    setMistakes(0);
    setElapsedSeconds(0);
    setStatus("playing");
  }, []);

  const resetGame = useCallback(() => {
    setBoard(cloneBoard(puzzle));
    setGivenCells(getGivenCells(puzzle));
    setSelectedCell({
      row: 0,
      col: 0,
    });
    setMistakes(0);
    setElapsedSeconds(0);
    setStatus("playing");
  }, [puzzle]);

  const placeValue = useCallback(
    (value: number) => {
      const { row, col } = selectedCell;

      if (givenCells[row][col] || status !== "playing" || isComplete) {
        return;
      }

      setBoard((currentBoard) => {
        if (currentBoard[row][col] === value) {
          return currentBoard;
        }

        const nextBoard = cloneBoard(currentBoard);
        nextBoard[row][col] = value;

        return nextBoard;
      });

      if (solution[row][col] !== value) {
        setMistakes((currentMistakes) => currentMistakes + 1);
      }
    },
    [givenCells, isComplete, selectedCell, solution, status],
  );

  const clearSelectedCell = useCallback(() => {
    const { row, col } = selectedCell;

    if (givenCells[row][col] || status !== "playing" || isComplete) {
      return;
    }

    setBoard((currentBoard) => {
      if (currentBoard[row][col] === EMPTY) {
        return currentBoard;
      }

      const nextBoard = cloneBoard(currentBoard);
      nextBoard[row][col] = EMPTY;

      return nextBoard;
    });
  }, [givenCells, isComplete, selectedCell, status]);

  const revealHint = useCallback(() => {
    if (status !== "playing" || isComplete) {
      return;
    }

    const openCells = board
      .flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => ({
          row: rowIndex,
          col: colIndex,
          cell,
        })),
      )
      .filter(({ row, col, cell }) => cell !== solution[row][col]);

    if (openCells.length === 0) {
      return;
    }

    const nextCell = openCells[Math.floor(Math.random() * openCells.length)];

    setBoard((currentBoard) => {
      const nextBoard = cloneBoard(currentBoard);
      nextBoard[nextCell.row][nextCell.col] = solution[nextCell.row][nextCell.col];

      return nextBoard;
    });
    setGivenCells((currentGivenCells) => {
      const nextGivenCells = currentGivenCells.map((row) => [...row]);
      nextGivenCells[nextCell.row][nextCell.col] = true;

      return nextGivenCells;
    });
    setSelectedCell({
      row: nextCell.row,
      col: nextCell.col,
    });
  }, [board, isComplete, solution, status]);

  const solvePuzzle = useCallback(() => {
    setBoard(cloneBoard(solution));
    setStatus("solved");
  }, [solution]);

  useEffect(() => {
    if (displayStatus !== "playing") {
      return;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [displayStatus]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key >= "1" && event.key <= "9") {
        event.preventDefault();
        placeValue(Number(event.key));
        return;
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        clearSelectedCell();
        return;
      }

      const directions: Record<string, CellPosition> = {
        ArrowUp: {
          row: -1,
          col: 0,
        },
        ArrowRight: {
          row: 0,
          col: 1,
        },
        ArrowDown: {
          row: 1,
          col: 0,
        },
        ArrowLeft: {
          row: 0,
          col: -1,
        },
      };

      const direction = directions[event.key];

      if (!direction) {
        return;
      }

      event.preventDefault();
      setSelectedCell((currentCell) => ({
        row: (currentCell.row + direction.row + SIZE) % SIZE,
        col: (currentCell.col + direction.col + SIZE) % SIZE,
      }));
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelectedCell, placeValue]);

  return (
    <main className="min-h-dvh w-screen bg-neutral-950 px-1 py-2 text-neutral-100 sm:px-3 md:px-6 md:py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-1rem)] w-full max-w-6xl flex-col gap-2 md:min-h-0 md:gap-4">
        <header className="flex items-center justify-between gap-2 md:items-end md:gap-4">
          <div>
            <p className="hidden font-mono text-xs uppercase text-amber-300 md:block">
              coatt.space
            </p>
            <h1 className="text-xl font-semibold md:mt-1 md:text-5xl">
              <span className="md:hidden">Sudoku</span>
              <span className="hidden md:inline">Sudoku Ranked</span>
            </h1>
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-1 rounded-md border border-neutral-800 bg-neutral-900/70 p-1 md:gap-2">
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map((level) => (
              <Button
                key={level}
                type="button"
                variant={difficulty === level ? "default" : "ghost"}
                className={cn(
                  "h-8 min-w-0 px-2 text-xs md:h-9 md:px-3 md:text-sm",
                  difficulty === level
                    ? "bg-amber-300 text-neutral-950 hover:bg-amber-200"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50",
                )}
                onClick={() => startGame(level)}
              >
                {DIFFICULTIES[level].label}
              </Button>
            ))}
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-between gap-2 lg:grid lg:flex-none lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-4">
          <div className="flex min-w-0 flex-col items-center gap-2 md:gap-4">
            <div className="grid w-full max-w-[39rem] grid-cols-4 gap-1.5 md:gap-2">
              <div className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 md:px-3 md:py-2">
                <p className="text-xs text-neutral-500">Time</p>
                <p className="font-mono text-sm text-neutral-50 md:text-lg">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>
              <div className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 md:px-3 md:py-2">
                <p className="text-xs text-neutral-500">Filled</p>
                <p className="font-mono text-sm text-neutral-50 md:text-lg">
                  {filledCells}/81
                </p>
              </div>
              <div className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 md:px-3 md:py-2">
                <p className="text-xs text-neutral-500">Mistakes</p>
                <p className="font-mono text-sm text-rose-300 md:text-lg">
                  {mistakes}
                </p>
              </div>
              <div className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 md:px-3 md:py-2">
                <p className="text-xs text-neutral-500">Status</p>
                <p
                  className={cn(
                    "truncate text-xs font-medium md:text-sm",
                    displayStatus === "complete"
                      ? "text-emerald-300"
                      : displayStatus === "solved"
                        ? "text-sky-300"
                        : "text-neutral-50",
                  )}
                >
                  {displayStatus === "complete"
                    ? "Complete"
                    : displayStatus === "solved"
                      ? "Solved"
                      : "Playing"}
                </p>
              </div>
            </div>

            <div className="grid aspect-square w-full max-w-[min(100%,calc(100dvh-16.25rem))] grid-cols-9 overflow-hidden rounded-md border-2 border-neutral-100 bg-neutral-950 shadow-2xl shadow-black/40 md:max-w-[39rem]">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const position = {
                    row: rowIndex,
                    col: colIndex,
                  };
                  const isSelected =
                    selectedCell.row === rowIndex && selectedCell.col === colIndex;
                  const isRelated =
                    selectedCell.row === rowIndex ||
                    selectedCell.col === colIndex ||
                    isSameBox(selectedCell, position);
                  const isMatching =
                    selectedValue !== EMPTY && selectedValue === cell;
                  const isGiven = givenCells[rowIndex][colIndex];
                  const isWrong =
                    cell !== EMPTY && cell !== solution[rowIndex][colIndex];

                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      type="button"
                      aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}`}
                      className={cn(
                        "grid aspect-square min-w-0 place-items-center text-2xl font-semibold outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-amber-300 sm:text-3xl",
                        rowIndex > 0 && "border-t border-t-neutral-700/70",
                        colIndex > 0 && "border-l border-l-neutral-700/70",
                        rowIndex > 0 &&
                          rowIndex % BOX === 0 &&
                          "border-t-2 border-t-neutral-100",
                        colIndex > 0 &&
                          colIndex % BOX === 0 &&
                          "border-l-2 border-l-neutral-100",
                        isSelected
                          ? "bg-amber-300 text-neutral-950"
                          : isWrong
                            ? "bg-rose-500/20 text-rose-200"
                            : isMatching
                              ? "bg-emerald-500/20 text-emerald-200"
                              : isRelated
                                ? "bg-sky-950/70 text-neutral-50"
                                : "bg-neutral-950 text-neutral-100",
                        isGiven
                          ? "font-black"
                          : "font-medium text-sky-200 hover:bg-sky-500/20",
                      )}
                      onClick={() =>
                        setSelectedCell({
                          row: rowIndex,
                          col: colIndex,
                        })
                      }
                    >
                      {cell === EMPTY ? "" : cell}
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-2 pb-1 md:gap-4 md:pb-0">
            <div className="grid grid-cols-9 gap-1.5 lg:grid-cols-3 lg:gap-2">
              {Array.from({ length: SIZE }, (_, index) => {
                const value = index + 1;
                const remaining = remainingByValue[index];

                return (
                  <button
                    key={value}
                    type="button"
                    className="grid h-12 min-w-0 place-items-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-100 transition-colors hover:border-amber-300 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-40 lg:aspect-square lg:h-auto"
                    disabled={remaining === 0 || displayStatus !== "playing"}
                    onClick={() => placeValue(value)}
                  >
                    <span className="text-lg font-semibold lg:text-3xl">{value}</span>
                    <span className="font-mono text-[0.65rem] leading-none text-neutral-500 lg:text-xs">
                      {remaining}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-4 gap-1.5 md:gap-2 lg:grid-cols-2">
              <Button
                type="button"
                variant="secondary"
                className="h-10 bg-neutral-800 px-2 text-neutral-100 hover:bg-neutral-700 md:h-11"
                onClick={() => startGame(difficulty)}
              >
                <Shuffle />
                New
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-10 bg-neutral-800 px-2 text-neutral-100 hover:bg-neutral-700 md:h-11"
                onClick={resetGame}
              >
                <RotateCcw />
                Reset
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-10 bg-neutral-800 px-2 text-neutral-100 hover:bg-neutral-700 md:h-11"
                onClick={revealHint}
                disabled={displayStatus !== "playing"}
              >
                <Lightbulb />
                Hint
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-10 bg-neutral-800 px-2 text-neutral-100 hover:bg-neutral-700 md:h-11"
                onClick={clearSelectedCell}
                disabled={
                  displayStatus !== "playing" ||
                  givenCells[selectedCell.row][selectedCell.col]
                }
              >
                <Eraser />
                Clear
              </Button>
            </div>

            <Button
              type="button"
              className="h-10 bg-emerald-300 text-neutral-950 hover:bg-emerald-200 md:h-11"
              onClick={solvePuzzle}
            >
              {displayStatus === "complete" ? <CheckCircle2 /> : <Sparkles />}
              {displayStatus === "complete" ? "Completed" : "Solve"}
            </Button>
          </aside>
        </section>
      </div>
    </main>
  );
}
