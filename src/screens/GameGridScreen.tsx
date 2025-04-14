// src/screens/GameGridScreen.tsx
import React from 'react';
import './GameGridScreen.css'; // We'll create this CSS file next

// Placeholder game data - replace with real data later
const games = [
  { id: 'tetris', name: 'Tetris', free: true },
  { id: 'snake', name: 'Snake', free: true },
  { id: 'snakes_ladders', name: 'Snakes & Ladders', free: true },
  { id: 'checkers', name: 'Checkers', free: true },
  { id: 'space_invaders', name: 'Space Invaders', free: false }, // Example locked game
  { id: 'crazy_eights', name: 'Crazy Eights', free: false }, // Example locked game
];

interface GameGridScreenProps {
  onSelectGame: (gameId: string) => void; // Function to handle game selection
}

const GameGridScreen: React.FC<GameGridScreenProps> = ({ onSelectGame }) => {
  return (
    <div className="game-grid-container">
      <h2>Choose Your Game!</h2>
      <div className="game-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className={`game-tile ${!game.free ? 'locked' : ''}`} // Add 'locked' class if not free
            onClick={() => game.free && onSelectGame(game.id)} // Only allow click if free (for now)
            role="button" // Accessibility
            tabIndex={0} // Accessibility
          >
            <div className="game-tile-icon"> {/* Placeholder for image/icon */}
              🎮
            </div>
            <span className="game-tile-name">{game.name}</span>
            {!game.free && <div className="lock-icon">🔒</div>} {/* Lock icon */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameGridScreen;