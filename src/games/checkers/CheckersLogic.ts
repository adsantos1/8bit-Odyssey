export type Player = 'black' | 'white';
export type PieceType = 'normal' | 'king';

export interface Piece {
  player: Player;
  type: PieceType;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: Player;
  selectedPiece: Position | null;
  validMoves: Position[];
  gameOver: boolean;
  winner: Player | null;
}

export const BOARD_SIZE = 8;
export const SQUARE_SIZE = 45;
export const PIECE_RADIUS = SQUARE_SIZE * 0.4;

export const COLORS = {
  LIGHT_SQUARE: '#F0D9B5',
  DARK_SQUARE: '#B58863',
  BLACK_PIECE: '#4A4A4A',
  WHITE_PIECE: '#FFFFFF',
  PIECE_STROKE: '#000000',
  SELECTED_PIECE: '#7B61FF',
  VALID_MOVE: 'rgba(123, 97, 255, 0.4)',
};

export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(BOARD_SIZE).fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  // Place black pieces
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: 'black', type: 'normal' };
      }
    }
  }

  // Place white pieces
  for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: 'white', type: 'normal' };
      }
    }
  }

  return board;
}

export function isValidPosition(position: Position): boolean {
  return position.row >= 0 && position.row < BOARD_SIZE &&
         position.col >= 0 && position.col < BOARD_SIZE;
}

export function getValidMoves(
  board: (Piece | null)[][],
  position: Position
): Position[] {
  const piece = board[position.row][position.col];
  if (!piece) return [];

  const moves: Position[] = [];
  const directions = piece.type === 'king' 
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]  // King can move in all diagonal directions
    : piece.player === 'black' 
      ? [[1, -1], [1, 1]]  // Black moves down
      : [[-1, -1], [-1, 1]];  // White moves up

  // Check regular moves
  for (const [dRow, dCol] of directions) {
    const newPos = {
      row: position.row + dRow,
      col: position.col + dCol
    };

    if (isValidPosition(newPos) && !board[newPos.row][newPos.col]) {
      moves.push(newPos);
    }
  }

  // Check jumps
  for (const [dRow, dCol] of directions) {
    const jumpOver = {
      row: position.row + dRow,
      col: position.col + dCol
    };

    const landingPos = {
      row: position.row + 2 * dRow,
      col: position.col + 2 * dCol
    };

    if (isValidPosition(jumpOver) && isValidPosition(landingPos)) {
      const jumpPiece = board[jumpOver.row][jumpOver.col];
      if (jumpPiece && 
          jumpPiece.player !== piece.player && 
          !board[landingPos.row][landingPos.col]) {
        moves.push(landingPos);
      }
    }
  }

  return moves;
}

export function shouldPromoteToKing(position: Position, player: Player): boolean {
  return (player === 'black' && position.row === BOARD_SIZE - 1) ||
         (player === 'white' && position.row === 0);
}

export function getClickedPosition(
  event: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): Position {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  return {
    row: Math.floor(y / SQUARE_SIZE),
    col: Math.floor(x / SQUARE_SIZE)
  };
}

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  gameState: GameState
): void {
  const { board, selectedPiece, validMoves } = gameState;

  // Clear the canvas
  ctx.clearRect(0, 0, BOARD_SIZE * SQUARE_SIZE, BOARD_SIZE * SQUARE_SIZE);

  // Draw board squares
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? COLORS.LIGHT_SQUARE : COLORS.DARK_SQUARE;
      ctx.fillRect(col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    }
  }

  // Draw valid moves
  validMoves.forEach(move => {
    ctx.fillStyle = COLORS.VALID_MOVE;
    ctx.beginPath();
    ctx.arc(
      (move.col + 0.5) * SQUARE_SIZE,
      (move.row + 0.5) * SQUARE_SIZE,
      PIECE_RADIUS,
      0,
      2 * Math.PI
    );
    ctx.fill();
  });

  // Draw pieces
  board.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      if (piece) {
        const centerX = (colIndex + 0.5) * SQUARE_SIZE;
        const centerY = (rowIndex + 0.5) * SQUARE_SIZE;

        // Draw piece
        ctx.beginPath();
        ctx.arc(centerX, centerY, PIECE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = piece.player === 'black' ? COLORS.BLACK_PIECE : COLORS.WHITE_PIECE;
        ctx.fill();
        ctx.strokeStyle = COLORS.PIECE_STROKE;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw king crown if piece is a king
        if (piece.type === 'king') {
          ctx.fillStyle = piece.player === 'black' ? COLORS.WHITE_PIECE : COLORS.BLACK_PIECE;
          ctx.beginPath();
          ctx.arc(centerX, centerY, PIECE_RADIUS * 0.4, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Highlight selected piece
        if (selectedPiece && 
            selectedPiece.row === rowIndex && 
            selectedPiece.col === colIndex) {
          ctx.strokeStyle = COLORS.SELECTED_PIECE;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    });
  });
} 