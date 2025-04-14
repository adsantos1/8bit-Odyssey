import { useState } from 'react'; // Import useState
import GameGridScreen from './screens/GameGridScreen'; // Import Grid Screen
import TetrisGame from './games/TetrisGame'; // Keep Tetris import
import './App.css';

function App() {
  // State to track the currently selected game ID (null means show grid)
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // Function passed to GameGridScreen to handle selection
  const handleSelectGame = (gameId: string) => {
    console.log("Selected game:", gameId); // Log selection
    setSelectedGameId(gameId); // Update state to show the game
  };

  // Function to go back to the grid (we'll need a button later)
  // const handleBackToGrid = () => {
  //   setSelectedGameId(null);
  // };

  return (
    <div className="App">
      <h1>8Bit Odyssey</h1>

      {/* Conditionally render Grid or Game based on state */}
      {selectedGameId === null ? (
        <GameGridScreen onSelectGame={handleSelectGame} />
      ) : selectedGameId === 'tetris' ? ( // Check which game is selected
        // Add a back button later!
        <TetrisGame /> 
      ) : (
         // Placeholder for other games or if ID doesn't match
         <p>Selected game: {selectedGameId} (Not implemented yet)</p> 
         // Add a back button here too!
      )}
    </div>
  );
}

export default App;