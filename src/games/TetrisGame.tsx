import { useRef, useEffect, useState, useCallback } from 'react';
// Optional: import './TetrisGame.css'; // Create this CSS file later if needed
import './TetrisGame.css'; 
// --- Game Constants ---
const COLS = 10; // Standard Tetris width
const ROWS = 20; // Standard Tetris height
const BLOCK_SIZE = 30; // Pixel size of each block - adjust as needed
const BOARD_WIDTH = COLS * BLOCK_SIZE;
const BOARD_HEIGHT = ROWS * BLOCK_SIZE;
// --- End Constants ---

// ... (after BOARD_HEIGHT constant)
const COLORS = [
    null, // 0: Empty cell - background color will show
    '#00ffff', // 1: I piece (Cyan)
    '#0000ff', // 2: J piece (Blue)
    '#ffaa00', // 3: L piece (Orange)
    '#ffff00', // 4: O piece (Yellow)
    '#00ff00', // 5: S piece (Green)
    '#aa00ff', // 6: T piece (Purple)
    '#ff0000', // 7: Z piece (Red)
  ];
  // --- End Constants ---

  const TETROMINOES: { [key: string]: { shape: number[][], color: number } } = {
    // --- Define Tetromino Shapes ---
    // We'll use numbers 1-7 corresponding to COLORS index
    'I': {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: 1 // Cyan
    },
    'J': {
        shape: [
            [2, 0, 0],
            [2, 2, 2],
            [0, 0, 0]
        ],
        color: 2 // Blue
    },
    'L': {
        shape: [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0]
        ],
        color: 3 // Orange
    },
    'O': {
        shape: [
            [4, 4],
            [4, 4]
        ],
        color: 4 // Yellow
    },
    'S': {
        shape: [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0]
        ],
        color: 5 // Green
    },
    'T': {
        shape: [
            [0, 6, 0],
            [6, 6, 6],
            [0, 0, 0]
        ],
        color: 6 // Purple
    },
    'Z': {
        shape: [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ],
        color: 7 // Red
    }
    // --- End Tetromino Shapes ---
  };
  
  const PIECE_TYPES = 'IJLOSTZ'; // String of piece type keys

  // Helper function to create an empty game board
const createEmptyBoard = (): number[][] => {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  };
  

  // --- Drawing Function ---
const drawBlock = (x: number, y: number, color: string | null, context: CanvasRenderingContext2D) => {
    if (!color) return; // Don't draw if color is null (empty cell)
  
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  
    // Optional: Add a border or highlight to blocks
    context.strokeStyle = '#111'; // Dark border
    context.lineWidth = 1;
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  };
  
  const drawBoard = (
    context: CanvasRenderingContext2D, 
    currentBoard: number[][],
    currentPiece: { pos: { x: number; y: number }; tetromino: number[][]; color: number } | null 
) => {

    // 1. Clear Canvas & Draw Landed Blocks (same as before)
  context.fillStyle = '#000'; 
  context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const blockType = currentBoard[y][x]; 
      if (blockType > 0) { 
        drawBlock(x, y, COLORS[blockType], context);
      }
    }
  }

  // 2. Draw the Active Piece (if it exists)
  if (currentPiece) {
    console.log("Drawing piece at:", currentPiece.pos);
    currentPiece.tetromino.forEach((row, yOffset) => {
      row.forEach((value, xOffset) => {
        if (value !== 0) { // If it's part of the piece shape
          const boardX = currentPiece.pos.x + xOffset;
          const boardY = currentPiece.pos.y + yOffset;
          // Make sure it's within board bounds before drawing (optional safety)
          if (boardX >= 0 && boardX < COLS && boardY >= 0 && boardY < ROWS) {
             drawBlock(boardX, boardY, COLORS[currentPiece.color], context);
          }
        }
      });
    });
  }

  // 3. Draw Grid Lines (Optional - same as before)
  // ... (grid line code) ...
};
// --- End Drawing Function ---
  
// *** NEW Collision Detection Function ***
const checkCollision = (
  piece: { pos: { x: number; y: number }; tetromino: number[][] }, 
  board: number[][]
): boolean => {
  const { pos, tetromino } = piece;

  for (let y = 0; y < tetromino.length; y++) {
    for (let x = 0; x < tetromino[y].length; x++) {
      // 1. Check if the cell is part of the Tetromino shape
      if (tetromino[y][x] !== 0) {
        const boardX = pos.x + x;
        const boardY = pos.y + y;

        // 2. Check collision with board boundaries (Left, Right, Bottom)
        if (
          boardX < 0 || // Gone past left wall
          boardX >= COLS || // Gone past right wall
          boardY >= ROWS    // Gone past bottom floor
        ) {
          console.log(`Collision: Boundary fail at [${boardX}, ${boardY}]`);
          return true; // Collision detected
        }

        // 3. Check collision with existing landed blocks on the board
        // Ensure we only check within board bounds vertically (avoid checking above row 0)
        if (boardY >= 0 && board[boardY][boardX] !== 0) {
            console.log(`Collision: Board block fail at [${boardX}, ${boardY}]`);
            return true; // Collision detected (hit another piece)
        }
      }
    }
  }

  // If we went through all blocks without returning true, there's no collision
  return false;
};
// --- End Helper Functions ---




const TetrisGame: React.FC = () => {
  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDropTime = useRef(0); 
  const requestRef = useRef<number | null>(null); // Initialize with null
  const gameRunning = useRef(true); 
  
  // --- State ---   
  const [board, setBoard] = useState<number[][]>(() => createEmptyBoard()); 
  const [piece, setPiece] = useState<{
    pos: { x: number; y: number }; 
    tetromino: number[][];       
    color: number;              
  } | null>(null); 
  const [dropInterval, _setDropInterval] = useState(1000); // Added 
  const [isGameOver, setIsGameOver] = useState(false); // <<< Moved state
  // --- End State ---  

  // --- Game Logic Functions ---
 // *** Modify spawnPiece ***
 const spawnPiece = useCallback(() => { 
  console.log("Attempting to spawn piece...");
  const randomType = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  const newTetrominoData = TETROMINOES[randomType];
  const newPiece = {
    pos: { x: Math.floor(COLS / 2) - Math.floor(newTetrominoData.shape[0].length / 2), y: 0 }, 
    tetromino: newTetrominoData.shape,
    color: newTetrominoData.color
  };

  // *** Add Game Over Check ***
  if (checkCollision(newPiece, board)) {
    // Game Over Condition: New piece collides immediately
    console.log("GAME OVER - Collision on spawn");
    gameRunning.current = false; // Stop the game loop
    // TODO: Display Game Over message to the user
    setPiece(null); // Clear the current piece state maybe? Or leave it to show collision.
    setIsGameOver(true); // <<< Set state here
    return; // Stop the function here
  }
  // *** End Game Over Check ***
  console.log("Spawning new piece:", randomType);
  setPiece(newPiece); // Update the state with the new piece
  lastDropTime.current = 0; // Reset drop timer

}, [board]); // *** Add 'board' as a dependency ***

  const drop = useCallback(() => {
    setPiece(prevPiece => {
      if (!prevPiece) return null;

      // Create a potential next position
      const nextPos = { ...prevPiece.pos, y: prevPiece.pos.y + 1 };
      const testPiece = { ...prevPiece, pos: nextPos }; // Piece at the next position

      // *** Use the new checkCollision function ***
      if (checkCollision(testPiece, board)) {
        // Collision detected! Land the piece.
        console.log("Collision detected by checkCollision!");

        // --- Landing Logic ---
        // 1. Merge the piece onto the board state
        // We need the setter function now! Rename _setBoard back to setBoard
        // Make sure setBoard is imported from useState
        
        // Create a new board copy to update
        const newBoard = board.map(row => [...row]); // Deep copy

        prevPiece.tetromino.forEach((row, yOffset) => {
          row.forEach((value, xOffset) => {
            if (value !== 0) {
              const boardX = prevPiece.pos.x + xOffset;
              const boardY = prevPiece.pos.y + yOffset;
              // Prevent writing outside board bounds (safety)
              if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                 newBoard[boardY][boardX] = prevPiece.color; 
              }
            }
          });
        });

        // Update the board state with the merged piece
        setBoard(newBoard); // Use the actual setter later

        // 2. Reset the piece state (ready for next spawn)
        // setPiece(null); // Set piece to null temporarily

        // 3. TODO: Clear lines (implement later)

        // 4. Spawn the next piece
        spawnPiece(); 

        // 5. Return null because the current piece is now part of the board
        return null; 
        // --- End Landing Logic ---

      } else {
        // No collision, just move the piece down
        return testPiece; // Return the piece at the valid next position
      }
    });
  }, [board, spawnPiece]); // *** Add 'board' and 'spawnPiece' to dependencies ***

  const gameLoop = useCallback((timestamp: number) => {
    if (!gameRunning.current) return; 

    if (!lastDropTime.current) {
        lastDropTime.current = timestamp; 
    }
    const deltaTime = timestamp - lastDropTime.current;

    if (deltaTime > dropInterval) {
        // console.log("Dropping piece"); // Keep for debugging if needed
        drop(); 
        lastDropTime.current = timestamp; 
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [dropInterval, drop]); 
  // --- End Game Logic Functions ---


  // --- Effects ---
  // Effect for Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // console.log("Drawing board/piece..."); // Keep for debugging if needed
    drawBoard(context, board, piece); 

  }, [board, piece]); // Dependencies: board, piece

  // Effect for Initial Spawn
  useEffect(() => {
    spawnPiece();
  }, [spawnPiece]); // *** Corrected: Dependency is spawnPiece ***
  

  // *** Corrected: Added Missing Effect for Game Loop Start/Stop ***
  useEffect(() => {
    console.log("Starting game loop");
    gameRunning.current = true; 
    lastDropTime.current = 0; 
    requestRef.current = requestAnimationFrame(gameLoop); // Start loop

    // Cleanup function
    return () => {
      console.log("Stopping game loop");
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current); // Stop loop on unmount
      }
      gameRunning.current = false;
    }
  }, [gameLoop]); // Dependency: gameLoop  


  // --- End Effects ---

  return (
    <div className="tetris-container">
    <canvas
      ref={canvasRef}
      width={BOARD_WIDTH}  // Use constant
      height={BOARD_HEIGHT} // Use constant
      className="tetris-canvas" // Optional className
      style={{ border: '1px solid grey' }}       
    ></canvas>
    {/* *** Add Game Over Display *** */}
    {isGameOver && (
        <div className="game-over-overlay">GAME OVER</div>
      )}
  </div>
  );
};




export default TetrisGame;