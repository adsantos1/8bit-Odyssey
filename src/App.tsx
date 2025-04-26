// App.tsx (Add Go Back Logic, Keep Preview Logic)

import { useState, useCallback, useEffect } from 'react'; // Keep useCallback
import GameGridScreen from './screens/GameGridScreen';
import { App as CapacitorApp } from '@capacitor/app';
// Keep these imports
import TetrisGame, { PieceData } from './games/tetris/TetrisGame';
import NextPiecePreview from './games/tetris/NextPiecePreview';
import SnakeGame from './games/snake/SnakeGame';
import CheckersGame from './games/checkers/CheckersGame';
import Menu from './components/Menu';
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

  // Handle menu item clicks
  const handleMenuItemClick = (item: string) => {
    console.log("Menu item clicked:", item);
    // Add menu item handling logic here
    switch (item) {
      case 'Home':
        // Handle Home
        break;
      case 'Modern Games':
        // Handle Modern Games
        break;
      case 'Phantom Files':
        // Handle Phantom Files
        break;
      case 'settings':
        // Handle settings
        break;
      case 'about':
        // Handle about
        break;
      case 'help':
        // Handle help
        break;
    }
  };

  // --- Add Function to Handle Going Back ---
  const handleGoBack = useCallback(() => {
    console.log("Navigating back to game grid via hardware back button");
    setSelectedGameId(null); // Set state to show the grid screen
    setNextPieceData(null); // Also reset preview data when going back
  }, []); // No dependencies needed as setSelectedGameId is stable

  // --- Add Global Back Button Listener Effect ---
  useEffect(() => {
    let listenerHandle: any = null;

    const registerBackButtonListener = async () => {
      try {
        console.log("App: Registering global back button listener...");
        listenerHandle = await CapacitorApp.addListener('backButton', (_event) => {
          console.log('App: Hardware back button pressed');

          // Check the current state to decide action
          if (selectedGameId !== null) {
            // If a game is currently selected, go back to the grid
            console.log('App: Navigating back to game grid from', selectedGameId);
            setSelectedGameId(null);
            // Reset preview state if using it
            // setNextPieceData(null);
          } else {
            // If on the game grid (selectedGameId is null), allow default behavior (exit app)
            // Adding the listener disables default behavior, so we might need to exit explicitly.
            // Let's try allowing it to exit naturally first. If it doesn't, uncomment the exitApp line.
            console.log('App: Back button pressed on grid screen, allowing default exit (or call exitApp).');
            // CapacitorApp.exitApp(); // Uncomment this line ONLY if the app doesn't exit from the grid screen on back press
          }
        });
        console.log("App: Global back button listener registered.");
      } catch (error) {
        console.error("App: Error registering global back button listener", error);
      }
    };

    registerBackButtonListener();

    // Cleanup function
    return () => {
      if (listenerHandle && typeof listenerHandle.remove === 'function') {
        console.log("App: Removing global back button listener");
        listenerHandle.remove();
      } else {
        console.log("App: Global listener handle not available or remove method missing.");
      }
    };
    // IMPORTANT: We add selectedGameId to dependency array so the logic inside the listener
    // always has the current value. However, this means the listener is removed/re-added
    // on every navigation, which is usually fine.
  }, [selectedGameId]); // <<< Add selectedGameId as dependency

  return (
    <div className="App">
      {/* --- Header Structure --- */}
      <div className={`app-header ${selectedGameId === 'tetris' ? 'tetris-active-header' : ''}`}>
        {/* Add Menu component */}
        <div className="header-menu">
          <Menu onMenuItemClick={handleMenuItemClick} />
        </div>
        {/* Only show title on home screen */}
        {!selectedGameId && (
          <h1 className="header-title">8Bit Odyssey</h1>
        )}
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
        <TetrisGame
          onNextPieceUpdate={handleNextPieceUpdate}
          onGoBack={handleGoBack}
        />
      ) : selectedGameId === 'snake' ? (
        <SnakeGame onGoBack={handleGoBack} />
      ) : selectedGameId === 'checkers' ? (
        <CheckersGame onGoBack={handleGoBack} />
      ) : (
        <div>
          <p>Selected game: {selectedGameId} (Not implemented yet)</p>
          <button onClick={() => setSelectedGameId(null)}>Back to Grid (Button)</button>
        </div>
      )}
    </div>
  );
}

export default App;