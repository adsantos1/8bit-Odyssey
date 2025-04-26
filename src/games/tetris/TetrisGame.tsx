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
export const COLORS = [
    null, // 0: Empty cell - background color will show
    '#00ffff', // 1: I piece (Cyan)
    '#0000ff', // 2: J piece (Blue)@
    '#ffaa00', // 3: L piece (Orange)
    '#ffff00', // 4: O piece (Yellow)
    '#00ff00', // 5: S piece (Green)
    '#aa00ff', // 6: T piece (Purple)
    '#ff0000', // 7: Z piece (Red)
  ];
  // --- End Constants ---


  const PIECE_TYPES = 'IJLOSTZ'; // String of piece type keys

  // --- Define a type for piece data (useful for state and props) ---
export type TetrominoShape = number[][];
export interface PieceData {
  tetromino: TetrominoShape;
  color: number;
}


const TETROMINOES: { [key: string]: PieceData } = { // Use PieceData type
  'I': {
      tetromino: [ // <<< Use 'tetromino'
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
      ], color: 1
  }, // <<< Comma
  'J': {
      tetromino: [ // <<< Use 'tetromino'
          [2, 0, 0],
          [2, 2, 2],
          [0, 0, 0]
      ], color: 2
  }, // <<< Comma
  'L': {
      tetromino: [ // <<< Use 'tetromino'
          [0, 0, 3],
          [3, 3, 3],
          [0, 0, 0]
      ], color: 3
  }, // <<< Comma
  'O': {
      tetromino: [ // <<< Use 'tetromino'
          [4, 4],
          [4, 4]
      ], color: 4
  }, // <<< Comma
  'S': {
      tetromino: [ // <<< Use 'tetromino'
          [0, 5, 5],
          [5, 5, 0],
          [0, 0, 0]
      ], color: 5
  }, // <<< Comma
  'T': {
      tetromino: [ // <<< Use 'tetromino'
          [0, 6, 0],
          [6, 6, 6],
          [0, 0, 0]
      ], color: 6
  }, // <<< Comma
  'Z': {
      tetromino: [ // <<< Use 'tetromino'
          [7, 7, 0],
          [0, 7, 7],
          [0, 0, 0]
      ], color: 7
  }
  // --- End Tetromino Shapes ---
};

  

  // Helper function to create an empty game board
const createEmptyBoard = (): number[][] => {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  };
  

  // --- Define Props Type ---
interface TetrisGameProps {
  // Keep score handling within TetrisGame for now, based on reversion
  // onLineClear: (linesCleared: number) => void; // Keep commented if score is local again

  // NEW: Callback to update App with the next piece
  onNextPieceUpdate: (piece: PieceData | null) => void;
}

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


// --- Define Props Type (Add onGoBack) ---
interface TetrisGameProps {
  onNextPieceUpdate: (piece: PieceData | null) => void; // Keep this
  onGoBack: () => void; // <<< Add this
}



const TetrisGame: React.FC<TetrisGameProps> = ({ onNextPieceUpdate}) => {
  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDropTime = useRef(0); 
  const requestRef = useRef<number | null>(null); // Initialize with null
  const gameRunning = useRef(true); 
  
  // --- State ---   
  const [board, setBoard] = useState<number[][]>(() => createEmptyBoard()); 
  const [piece, setPiece] = useState<(PieceData & { pos: { x: number; y: number } }) | null>(null);
  // This type means: 'piece' can be null OR an object that combines
  // all properties from PieceData (tetromino, color) AND a 'pos' property.
  const [nextPiece, setNextPiece] = useState<PieceData | null>(null); // <<< State for next piece
  const [score, setScore] = useState(0); // <<< Add score state back HERE
  const [dropInterval, _setDropInterval] = useState(1000); // Added 
  const [isGameOver, setIsGameOver] = useState(false); // <<< Moved state  
  // --- End State ---  

  // --- Helper: Get a new random piece ---
  const getRandomPiece = useCallback((): PieceData => {
    const randomType = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
    const newTetrominoData = TETROMINOES[randomType];
    console.log("Generated random piece:", randomType); // Debugging
    return {
      tetromino: newTetrominoData.tetromino, // <<< Use tetromino
      color: newTetrominoData.color,
    };
  }, []); // No dependencies needed

  
  // --- Game Logic Functions ---
 // *** Modify spawnPiece ***
 const spawnPiece = useCallback(() => {
  console.log("--- spawnPiece Called ---");

  // 1. Determine the piece to spawn (should be the current 'nextPiece' state)
  const pieceToSpawn = nextPiece; // This came from the *previous* getRandomPiece call
  console.log("Spawn: pieceToSpawn (based on current nextPiece state):", pieceToSpawn);

  if (!pieceToSpawn) {
      console.error("Spawn: Cannot spawn, nextPiece state is null!");
      return;
  }

  // 2. Calculate initial position
  const initialPos = {
    x: Math.floor(COLS / 2) - Math.floor(pieceToSpawn.tetromino[0].length / 2),
    y: 0
  };

  // 3. Create the full object for the piece that will become active
  const newActivePiece = { ...pieceToSpawn, pos: initialPos };

  // 4. Generate the *new* "next" piece
  const brandNewNextPiece = getRandomPiece();
  console.log("Spawn: Generated brandNewNextPiece:", brandNewNextPiece);

  // 5. Check for collision
  if (checkCollision(newActivePiece, board)) {
    console.log("Spawn: GAME OVER - Collision on spawn");
    gameRunning.current = false;
    setIsGameOver(true);
    setNextPiece(null);
    onNextPieceUpdate(null); // Clear preview on game over
    console.log("Spawn: Clearing next piece state and preview.");
    return;
  }

  // 6. No collision - Update states:
  setPiece(newActivePiece); // <<< Set active piece state
  console.log("Spawn: Setting ACTIVE piece state to:", newActivePiece); // <<< Log active piece

  setNextPiece(brandNewNextPiece); // <<< Set next piece state
  console.log("Spawn: Setting NEXT piece state to:", brandNewNextPiece); // <<< Log next piece state

  onNextPieceUpdate(brandNewNextPiece); // <<< Report to preview
  console.log("Spawn: Reporting next piece for PREVIEW:", brandNewNextPiece); // <<< Log preview piece

  lastDropTime.current = 0;
  console.log("--- spawnPiece Complete ---");

}, [nextPiece, getRandomPiece, board, onNextPieceUpdate, setIsGameOver]);


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
        const newBoard = board.map(row => [...row]); // Deep copy
        prevPiece.tetromino.forEach((row, yOffset) => {
          row.forEach((value, xOffset) => {
            if (value !== 0) {
              const boardX = prevPiece.pos.x + xOffset;
              const boardY = prevPiece.pos.y + yOffset;
              if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                 newBoard[boardY][boardX] = prevPiece.color;
              }
            }
          });
        });

        // --- Add Line Clearing Logic HERE ---
        let linesCleared = 0;
        const boardAfterClearing: number[][] = [];

        // Iterate through the board from bottom to top
        for (let y = newBoard.length - 1; y >= 0; y--) {
            // Check if the row is full (no cells contain 0)
            if (newBoard[y].every(cell => cell !== 0)) {
                linesCleared++;
                // Don't add this row to boardAfterClearing, effectively removing it
            } else {
                // If the row is not full, add it to the top of our new board array
                boardAfterClearing.unshift([...newBoard[y]]); // Add to beginning
            }
        }

        // Add new empty rows at the top for each cleared line
        for (let i = 0; i < linesCleared; i++) {
            boardAfterClearing.unshift(Array(COLS).fill(0)); // Add new empty row at the top
        }

         // --- Add Scoring Logic HERE ---
         if (linesCleared > 0) {
          console.log(`Lines Cleared: ${linesCleared}`);
          // Score based on number of lines cleared at once
          // (Points values can be adjusted)
          const points = [0, 40, 100, 300, 1200]; // Points for 0, 1, 2, 3, 4 lines
          const lineScore = points[linesCleared] || 0; // Get score for lines cleared

          setScore(prevScore => prevScore + lineScore); // Add to previous score
        }

        // TODO: Add scoring based on linesCleared later

        // --- End Line Clearing Logic ---


        // Update the board state with the potentially modified board
        setBoard(boardAfterClearing); // <<< Use boardAfterClearing

        // Spawn the next piece
        spawnPiece();

        // Return null because the current piece is now part of the board
        return null;
        // --- End Landing Logic ---

      } else {
        // No collision, just move the piece down
        return testPiece;
      }
    });
  }, [board, spawnPiece]); // Keep dependencies

  // --- Add movePiece Function HERE ---
const movePiece = useCallback((dir: number) => { // dir is -1 for left, 1 for right
  // Make sure 'piece' state is accessible here
  if (!piece) return; // Don't move if no piece exists

  setPiece(prevPiece => {
      if (!prevPiece) return null; // Should not happen if check above is done, but good practice

      const nextPos = { ...prevPiece.pos, x: prevPiece.pos.x + dir };
      const testPiece = { ...prevPiece, tetromino: prevPiece.tetromino, pos: nextPos }; // Use prevPiece.tetromino

      // Use the existing checkCollision function
      if (!checkCollision(testPiece, board)) {
          // If no collision, update the piece's position
          return testPiece;
      }
      // If collision, return the previous state (don't move)
      return prevPiece;
  });
// Add dependencies: 'board' state and 'piece' state are needed.
// checkCollision doesn't change, so it's not strictly needed, but including it is okay.
}, [board, piece]); // <<< Add piece state as dependency

// --- Add rotatePiece Function HERE ---
const rotatePiece = useCallback(() => {
  // Ensure 'piece' state is accessible
  if (!piece) return;

  setPiece(prevPiece => {
      if (!prevPiece) return null;

      // 1. Rotate the tetromino matrix (simple clockwise rotation)
      const shape = prevPiece.tetromino;
      const N = shape.length;
      // Create a new matrix for the rotated shape, filled with 0s
      const rotatedShape = Array.from({ length: N }, () => Array(N).fill(0));

      for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
              // Transpose + Reverse row = Clockwise rotation
              rotatedShape[x][N - 1 - y] = shape[y][x];
          }
      }

      const testPiece = { ...prevPiece, tetromino: rotatedShape };

      // 2. Check for collision after rotation
      //    (Wall kicks would be added here if desired)
      if (!checkCollision(testPiece, board)) {
          return testPiece; // Rotation is valid
      }

      // If rotation fails, return original piece
      return prevPiece;
  });
// Add dependencies: 'board' and 'piece' states.
}, [board, piece]); // <<< Add piece state as dependency

// --- Add handleKeyDown Function HERE ---
const handleKeyDown = useCallback((event: KeyboardEvent) => {
  // Make sure gameRunning ref and piece state are accessible
  if (!gameRunning.current || !piece) return;

  switch (event.key) {
      case 'ArrowLeft':
          movePiece(-1); // Call the function from step 1
          break;
      case 'ArrowRight':
          movePiece(1); // Call the function from step 1
          break;
      case 'ArrowDown':
          drop(); // Call existing drop function
          break;
      case 'ArrowUp': // Using ArrowUp for rotation
          rotatePiece(); // Call the function from step 2
          break;
  }
// Dependencies: The functions it calls, and the state/refs it checks.
}, [gameRunning, piece, movePiece, rotatePiece, drop]); // <<< Added dependencies


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

 
   // Effect for Initial Spawn (Revised for Next Piece Logic + Debugging)
   useEffect(() => {
    console.log("--- Initial Setup ---");
    // 1. Generate the very first piece that will be active
    const firstActivePieceData = getRandomPiece();
    console.log("Initial Setup: Generated firstActivePieceData", firstActivePieceData);

    // 2. Calculate its position
    const initialPos = {
        x: Math.floor(COLS / 2) - Math.floor(firstActivePieceData.tetromino[0].length / 2),
        y: 0
    };

    // 3. Check for immediate collision
     if (checkCollision({ ...firstActivePieceData, pos: initialPos }, board)) {
         console.error("Immediate Game Over on initial load?");
         setIsGameOver(true);
         gameRunning.current = false;
     } else {
        // 4. Set the first active piece state
        const firstActivePieceWithPos = { ...firstActivePieceData, pos: initialPos };
        setPiece(firstActivePieceWithPos); // <<< Set state
        console.log("Initial Setup: Setting ACTIVE piece state to:", firstActivePieceWithPos); // <<< Log active piece
     }

    // 5. Generate the piece that will be shown as "next" initially
    const firstNextPieceData = getRandomPiece();
    console.log("Initial Setup: Generated firstNextPieceData", firstNextPieceData);

    // 6. Set the 'nextPiece' state
    setNextPiece(firstNextPieceData); // <<< Set state
    console.log("Initial Setup: Setting NEXT piece state to:", firstNextPieceData); // <<< Log next piece state

    // 7. Report this first 'next' piece to the App for the preview
    onNextPieceUpdate(firstNextPieceData); // <<< Report to preview
    console.log("Initial Setup: Reporting next piece for PREVIEW:", firstNextPieceData); // <<< Log preview piece

    console.log("--- Initial Setup Complete ---");

  }, [getRandomPiece, onNextPieceUpdate, board, setIsGameOver]);

  

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

  // --- Add Keyboard Listener Effect HERE ---
useEffect(() => {
  console.log("Adding keydown listener");
  document.addEventListener('keydown', handleKeyDown);

  // Cleanup function: Remove listener when component unmounts
  return () => {
      console.log("Removing keydown listener");
      document.removeEventListener('keydown', handleKeyDown);
  };
// Dependency: The handler function itself. React ensures it's stable if defined with useCallback.
}, [handleKeyDown]); // <<< Dependency is the handler


  // --- End Effects ---

  return (
    // Make sure this container has position: relative in your CSS
    <div className="tetris-container">
      {/* --- Add Score Display HERE (Temporary) --- */}
      <div className="score-display">
        Score: {score}
      </div>
      {/* --- End Score Display --- */}
      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        className="tetris-canvas"
        style={{ border: '1px solid grey' }}
      ></canvas>

      {/* Game Over Display */}
      {isGameOver && (
          <div className="game-over-overlay">GAME OVER</div>
      )}

      {/* --- Add On-Screen Controls HERE --- */}
      {!isGameOver && ( // Optionally hide controls when game is over
        <div className="on-screen-controls">
          <button className="control-button left" onClick={() => movePiece(-1)}>←</button>
          <button className="control-button right" onClick={() => movePiece(1)}>→</button>
          <button className="control-button rotate" onClick={rotatePiece}>↻</button> {/* Using rotatePiece directly */}
          <button className="control-button down" onClick={drop}>↓</button>       {/* Using drop directly */}
        </div>
      )}
      {/* --- End On-Screen Controls --- */}

    </div>
  );
}; // End of TetrisGame component




export default TetrisGame;