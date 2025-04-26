import React from 'react';
import './ModernGamesScreen.css';

interface ModernGamesScreenProps {
  onSelectGame: (gameId: string) => void;
}

interface ModernGame {
  id: string;
  name: string;
  description: string;
  free: boolean;
}

const ModernGamesScreen: React.FC<ModernGamesScreenProps> = ({ onSelectGame }) => {
  const games: ModernGame[] = [
    // Add future modern games here
  ];

  return (
    <div className="game-grid-container">
      <div className="game-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className={`game-tile`}
            onClick={() => onSelectGame(game.id)}
            role="button"
            tabIndex={0}
          >
            <div className="game-tile-icon">
              🎮
            </div>
            <span className="game-tile-name">{game.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModernGamesScreen; 