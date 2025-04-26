import React, { useEffect, useRef, useState } from 'react';
import {
  BOARD_SIZE,
  SQUARE_SIZE,
  GameState,
  Position,
  Piece,
  Player,
  createInitialBoard,
  drawBoard,
  getClickedPosition,
  getValidMoves,
  shouldPromoteToKing
} from './CheckersLogic';
import { getBestMove } from './CheckersAI';
import './CheckersGame.css';

type Difficulty = 'easy' | 'medium' | 'hard';

interface CheckersGameProps {
  onGoBack: () => void;
}

const CheckersGame: React.FC<CheckersGameProps> = ({ onGoBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'black', // Start with AI's turn
    selectedPiece: null,
    validMoves: [],
    gameOver: false,
    winner: null
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  // Effect for AI moves
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (gameState.currentPlayer === 'black' && !gameState.gameOver) {
      // Add a small delay before AI move
      timeoutId = setTimeout(() => {
        const aiMove = getBestMove(gameState.board, difficulty);
        if (aiMove) {
          makeMove(aiMove.to, aiMove.from);
        }
      }, 500); // 500ms delay
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [gameState.currentPlayer, gameState.gameOver, difficulty]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = BOARD_SIZE * SQUARE_SIZE;
    canvas.height = BOARD_SIZE * SQUARE_SIZE;

    drawBoard(ctx, gameState);
  }, [gameState]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState.gameOver || gameState.currentPlayer === 'black') return;

    const clickedPosition = getClickedPosition(event, canvas);
    const clickedPiece = gameState.board[clickedPosition.row][clickedPosition.col];

    // If no piece is selected and clicked on own piece, select it
    if (!gameState.selectedPiece && clickedPiece?.player === 'white') {
      const validMoves = getValidMoves(gameState.board, clickedPosition);
      setGameState(prev => ({
        ...prev,
        selectedPiece: clickedPosition,
        validMoves
      }));
      return;
    }

    // If piece is selected and clicked on valid move, make the move
    if (gameState.selectedPiece && isValidMove(clickedPosition)) {
      makeMove(clickedPosition);
      return;
    }

    // Deselect piece
    setGameState(prev => ({
      ...prev,
      selectedPiece: null,
      validMoves: []
    }));
  };

  const isValidMove = (position: Position): boolean => {
    return gameState.validMoves.some(
      move => move.row === position.row && move.col === position.col
    );
  };

  const checkGameOver = (board: (Piece | null)[][]): { gameOver: boolean; winner: Player | null } => {
    const blackPieces = board.flat().filter(piece => piece?.player === 'black').length;
    const whitePieces = board.flat().filter(piece => piece?.player === 'white').length;

    if (blackPieces === 0) return { gameOver: true, winner: 'white' };
    if (whitePieces === 0) return { gameOver: true, winner: 'black' };

    // Check if current player has any valid moves
    const hasValidMoves = board.some((row, rowIndex) =>
      row.some((piece, colIndex) => {
        if (piece?.player === gameState.currentPlayer) {
          const moves = getValidMoves(board, { row: rowIndex, col: colIndex });
          return moves.length > 0;
        }
        return false;
      })
    );

    if (!hasValidMoves) {
      return { gameOver: true, winner: gameState.currentPlayer === 'black' ? 'white' : 'black' };
    }

    return { gameOver: false, winner: null };
  };

  const makeMove = (newPosition: Position, fromPosition?: Position) => {
    const selectedPiece = fromPosition || gameState.selectedPiece;
    if (!selectedPiece) return;

    const newBoard = gameState.board.map(row => [...row]);
    const piece = newBoard[selectedPiece.row][selectedPiece.col];
    
    if (!piece) return;

    // Move piece
    newBoard[selectedPiece.row][selectedPiece.col] = null;
    newBoard[newPosition.row][newPosition.col] = {
      ...piece,
      type: shouldPromoteToKing(newPosition, piece.player) ? 'king' : piece.type
    };

    // Remove jumped piece if it was a jump move
    const rowDiff = Math.abs(newPosition.row - selectedPiece.row);
    if (rowDiff === 2) {
      const jumpedRow = (newPosition.row + selectedPiece.row) / 2;
      const jumpedCol = (newPosition.col + selectedPiece.col) / 2;
      newBoard[jumpedRow][jumpedCol] = null;
    }

    const { gameOver, winner } = checkGameOver(newBoard);

    setGameState({
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'black' ? 'white' : 'black',
      selectedPiece: null,
      validMoves: [],
      gameOver,
      winner
    });
  };

  const resetGame = () => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'black', // Start with AI's turn
      selectedPiece: null,
      validMoves: [],
      gameOver: false,
      winner: null
    });
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setShowModeDropdown(false);
    // Optional: Reset the game when difficulty changes
    resetGame();
  };

  return (
    <div className="checkers-game">
      <h1 className="game-title">Checkers</h1>
      <div className="game-header">
        <button className="back-button" onClick={onGoBack}>
          Back
        </button>
        <div className="turn-indicator">
          {gameState.gameOver 
            ? `Game Over - ${gameState.winner} wins!`
            : gameState.currentPlayer === 'black' 
              ? "AI is thinking..." 
              : "Your turn"}
        </div>
        {gameState.gameOver && (
          <button className="reset-button" onClick={resetGame}>
            Play Again
          </button>
        )}
      </div>
      <div className="game-container">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          onClick={handleClick}
        />
        <div className="mode-selector">
          <button 
            className="mode-button"
            onClick={() => setShowModeDropdown(!showModeDropdown)}
          >
            Mode: {difficulty}
          </button>
          {showModeDropdown && (
            <div className="mode-dropdown">
              <div 
                className="mode-option"
                onClick={() => handleDifficultyChange('easy')}
              >
                Easy
              </div>
              <div 
                className="mode-option"
                onClick={() => handleDifficultyChange('medium')}
              >
                Medium
              </div>
              <div 
                className="mode-option"
                onClick={() => handleDifficultyChange('hard')}
              >
                Hard
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckersGame; 