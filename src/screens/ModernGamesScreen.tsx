import React from 'react';
import './ModernGamesScreen.css';

interface ModernGamesScreenProps {
  onSelectGame: (gameId: string) => void;
}

const ModernGamesScreen: React.FC<ModernGamesScreenProps> = ({ onSelectGame }) => {
  const games = [
    {
      id: 'legendary-wave',
      name: 'Legendary Wave',
      description: 'An epic surfing adventure with stunning visuals and challenging gameplay.',
      free: false
    }
  ];

  return (
    <div className="game-grid-container">
      <div className="game-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className={`game-tile ${!game.free ? 'locked' : ''}`}
            onClick={() => game.free && onSelectGame(game.id)}
            role="button"
            tabIndex={0}
          >
            <div className="game-tile-icon">
              🎮
            </div>
            <span className="game-tile-name">{game.name}</span>
            {!game.free && <div className="lock-icon">🔒</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModernGamesScreen; 