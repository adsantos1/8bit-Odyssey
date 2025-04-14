import { useState, useCallback } from 'react'; // Import useState
import GameGridScreen from './screens/GameGridScreen'; // Import Grid Screen
import TetrisGame, { PieceData } from './games/TetrisGame'; // Keep Tetris import
import NextPiecePreview from './games/NextPiecePreview'; // Import the new component
import './App.css';

function App() {
  // State to track the currently selected game ID (null means show grid)
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
   // const [score, setScore] = useState(0); // Score is now local to TetrisGame again
   const [nextPieceData, setNextPieceData] = useState<PieceData | null>(null); // <<< State for preview data

  // Function passed to GameGridScreen to handle selection
  const handleSelectGame = (gameId: string) => {
    console.log("Selected game:", gameId); // Log selection
    setSelectedGameId(gameId); // Update state to show the game
    setNextPieceData(null); // Reset preview when changing game
  };

  // --- Callback to receive next piece update ---
  const handleNextPieceUpdate = useCallback((piece: PieceData | null) => {
    setNextPieceData(piece);
  }, []); // Empty dependency array, setter is stable

  // Function to go back to the grid (we'll need a button later)
  // const handleBackToGrid = () => {
  //   setSelectedGameId(null);
  // };

  return (
    <div className="App">
      {/* --- Updated Header Structure --- */}
      <div className="app-header">
        {/* Title on the Left */}
        <h1 className="header-title">8Bit Odyssey</h1>

        {/* Preview on the Right (only when Tetris is active) */}
        {selectedGameId === 'tetris' && (
          <div className="header-preview">
             <NextPiecePreview pieceData={nextPieceData} />
          </div>
        )}
      </div>
      {/* --- End Header Structure --- */}

      {/* Conditional Rendering */}
      {selectedGameId === null ? (
        <GameGridScreen onSelectGame={handleSelectGame} />
      ) : selectedGameId === 'tetris' ? (
        // Pass the new callback down
        <TetrisGame onNextPieceUpdate={handleNextPieceUpdate} />
      ) : (
        <div> {/* Other games placeholder */}
          <p>Selected game: {selectedGameId} (Not implemented yet)</p>
        </div>
      )}
    </div>
  );
}

export default App;