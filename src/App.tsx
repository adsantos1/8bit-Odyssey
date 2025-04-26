// App.tsx (Add Go Back Logic, Keep Preview Logic)

import { useState, useCallback, useEffect } from 'react'; // Keep useCallback
import GameGridScreen from './screens/GameGridScreen';
import ModernGamesScreen from './screens/ModernGamesScreen';
import { App as CapacitorApp } from '@capacitor/app';
// Keep these imports
import TetrisGame from './games/tetris/TetrisGame';
import SnakeGame from './games/snake/SnakeGame';
import CheckersGame from './games/checkers/CheckersGame';
import Menu from './components/Menu';
import LegendaryWave from './games/legendarywave/LegendaryWave';
import './App.css';

function App() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>('legendary-wave');
  const [currentScreen, setCurrentScreen] = useState<'retro' | 'modern'>('retro');

  const handleSelectGame = (gameId: string) => {
    console.log("Selected game:", gameId);
    setSelectedGameId(gameId);
  };

  // Handle menu item clicks
  const handleMenuItemClick = (item: string) => {
    console.log("Menu item clicked:", item);
    switch (item) {
      case 'Home':
        setSelectedGameId(null); // Return to game grid screen
        setCurrentScreen('retro');
        break;
      case 'Modern Games':
        setSelectedGameId(null);
        setCurrentScreen('modern');
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
          } else if (currentScreen === 'modern') {
            // If on modern games screen, go back to retro screen
            setCurrentScreen('retro');
          } else {
            // If on the game grid (selectedGameId is null), allow default behavior (exit app)
            console.log('App: Back button pressed on grid screen, allowing default exit (or call exitApp).');
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
  }, [selectedGameId, currentScreen]); // Add currentScreen to dependencies

  return (
    <div className="App">
      {/* --- Header Structure --- */}
      <div className={`app-header ${selectedGameId === 'tetris' ? 'tetris-active-header' : ''}`}>
        {/* Add Menu component */}
        <div className="header-menu">
          <Menu onMenuItemClick={handleMenuItemClick} />
        </div>
        {/* Only show title on home screens */}
        {!selectedGameId && (
          <h1 className="header-title">
            {currentScreen === 'retro' ? '8Bit Odyssey' : 'Modern Games'}
          </h1>
        )}
      </div>
      {/* --- End Header Structure --- */}

      {/* Conditional Rendering */}
      {selectedGameId === null ? (
        currentScreen === 'retro' ? (
          <GameGridScreen onSelectGame={handleSelectGame} />
        ) : (
          <ModernGamesScreen onSelectGame={handleSelectGame} />
        )
      ) : selectedGameId === 'tetris' ? (
        <TetrisGame
          onGoBack={handleGoBack}
        />
      ) : selectedGameId === 'snake' ? (
        <SnakeGame onGoBack={handleGoBack} />
      ) : selectedGameId === 'checkers' ? (
        <CheckersGame onGoBack={handleGoBack} />
      ) : selectedGameId === 'legendary-wave' ? (
        <LegendaryWave onGoBack={handleGoBack} />
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