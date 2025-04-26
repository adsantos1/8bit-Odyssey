import { Piece, Position, Player, getValidMoves } from './CheckersLogic';

interface Move {
  from: Position;
  to: Position;
}

// Piece values for evaluation
const PIECE_VALUES = {
  normal: 10,
  king: 20
};

// Position bonus for normal pieces (encourages advancement)
const POSITION_BONUS = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 3, 3, 3],
  [4, 4, 4, 4, 4, 4, 4, 4],
  [5, 5, 5, 5, 5, 5, 5, 5],
  [6, 6, 6, 6, 6, 6, 6, 6],
  [7, 7, 7, 7, 7, 7, 7, 7]
];

// Evaluate the board state for a given player
function evaluateBoard(board: (Piece | null)[][], player: Player): number {
  let score = 0;
  
  board.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        const positionBonus = piece.type === 'normal' ? 
          (piece.player === 'white' ? POSITION_BONUS[rowIndex][colIndex] : POSITION_BONUS[7 - rowIndex][colIndex]) : 
          3; // Kings get a flat bonus for position

        if (piece.player === player) {
          score += value + positionBonus;
        } else {
          score -= value + positionBonus;
        }
      }
    });
  });

  return score;
}

// Get all valid moves for a player
function getAllValidMoves(board: (Piece | null)[][], player: Player): Move[] {
  const moves: Move[] = [];

  board.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      if (piece && piece.player === player) {
        const validMoves = getValidMoves(board, { row: rowIndex, col: colIndex });
        validMoves.forEach(to => {
          moves.push({
            from: { row: rowIndex, col: colIndex },
            to
          });
        });
      }
    });
  });

  return moves;
}

// Make a move on a board copy and return the new board
function makeMove(board: (Piece | null)[][], move: Move): (Piece | null)[][] {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[move.from.row][move.from.col];
  
  if (!piece) return newBoard;

  // Move piece
  newBoard[move.from.row][move.from.col] = null;
  newBoard[move.to.row][move.to.col] = {
    ...piece,
    type: (move.to.row === 0 || move.to.row === 7) ? 'king' : piece.type
  };

  // Handle jumps
  const rowDiff = Math.abs(move.to.row - move.from.row);
  if (rowDiff === 2) {
    const jumpedRow = (move.to.row + move.from.row) / 2;
    const jumpedCol = (move.to.col + move.from.col) / 2;
    newBoard[jumpedRow][jumpedCol] = null;
  }

  return newBoard;
}

// Minimax algorithm with alpha-beta pruning
function minimax(
  board: (Piece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  player: Player
): { score: number; move?: Move } {
  if (depth === 0) {
    return { score: evaluateBoard(board, player) };
  }

  const moves = getAllValidMoves(board, maximizingPlayer ? player : (player === 'white' ? 'black' : 'white'));
  
  if (moves.length === 0) {
    return { score: maximizingPlayer ? -1000 : 1000 }; // Game over
  }

  let bestMove: Move | undefined;

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evalResult = minimax(newBoard, depth - 1, alpha, beta, false, player);
      
      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evalResult = minimax(newBoard, depth - 1, alpha, beta, true, player);
      
      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestMove = move;
      }
      
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

// Main function to get AI move
export function getBestMove(board: (Piece | null)[][]): Move | null {
  const result = minimax(board, 4, -Infinity, Infinity, true, 'black');
  return result.move || null;
} 