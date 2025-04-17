// App.tsx (Add Go Back Logic, Keep Preview Logic)

import { useState, useCallback } from 'react'; // Keep useCallback
import GameGridScreen from './screens/GameGridScreen';
// Keep these imports
import TetrisGame, { PieceData } from './games/TetrisGame';
import NextPiecePreview from './games/NextPiecePreview';
import './App.css';


function App() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  // Keep preview state
  const [nextPieceData, setNextPieceData] = useState<PieceData | null>(null);

  const handleSelectGame = (gameId: string) => {
    console.log("Selected game:", gameId);
    setSelectedGameId(gameId);
    setNextPieceData(null); // Keep resetting preview on new game
  };

  // Keep preview update callback
  const handleNextPieceUpdate = useCallback((piece: PieceData | null) => {
    setNextPieceData(piece);
  }, []);

  // --- Add Function to Handle Going Back ---
  const handleGoBack = useCallback(() => {
    console.log("Navigating back to game grid via hardware back button");
    setSelectedGameId(null); // Set state to show the grid screen
    setNextPieceData(null); // Also reset preview data when going back
  }, []); // No dependencies needed as setSelectedGameId is stable

  return (
    <div className="App">
      {/* --- Header Structure (Keep Preview) --- */}
      <div className="app-header">
        <h1 className="header-title">8Bit Odyssey</h1>
        {/* Keep Preview rendering */}
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
        // Pass BOTH callbacks down
        <TetrisGame
           onNextPieceUpdate={handleNextPieceUpdate} // Keep this
           onGoBack={handleGoBack} // <<< ADD THIS PROP
        />
      ) : (
        <div> {/* Other games placeholder */}
          <p>Selected game: {selectedGameId} (Not implemented yet)</p>
           <button onClick={handleGoBack}>Back to Grid</button>
        </div>
      )}
    </div>
  );
}

export default App;