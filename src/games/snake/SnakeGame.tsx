import React, { useEffect, useRef, useState } from 'react';
import './SnakeGame.css';

interface SnakeGameProps {
  onGoBack?: () => void;
}

// Game constants
const CELL_SIZE = 20;
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = 'RIGHT';
const GAME_SPEED = 150;

interface Position {
  x: number;
  y: number;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onGoBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  // Generate random food position
  const generateFood = (): Position => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    return newFood;
  };

  // Check collisions
  const checkCollision = (head: Position): boolean => {
    // Wall collision
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }

    return false;
  };

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      const head = { ...snake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      if (checkCollision(head)) {
        setGameOver(true);
        return;
      }

      const newSnake = [head];
      const ate = head.x === food.x && head.y === food.y;

      if (ate) {
        setScore(prev => prev + 1);
        setFood(generateFood());
        newSnake.push(...snake);
      } else {
        newSnake.push(...snake.slice(0, -1));
      }

      setSnake(newSnake);
    };

    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [snake, direction, food, gameOver]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake in classic green
    ctx.fillStyle = '#00FF00';
    snake.forEach(segment => {
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw food in red
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(
      food.x * CELL_SIZE,
      food.y * CELL_SIZE,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );

  }, [snake, food]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          setActiveButton('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          setActiveButton('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          setActiveButton('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          setActiveButton('RIGHT');
          break;
      }
      // Reset active button after a short delay
      setTimeout(() => setActiveButton(null), 150);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  // Handle button controls
  const handleButtonPress = (newDirection: string) => {
    switch (newDirection) {
      case 'UP':
        if (direction !== 'DOWN') setDirection('UP');
        break;
      case 'DOWN':
        if (direction !== 'UP') setDirection('DOWN');
        break;
      case 'LEFT':
        if (direction !== 'RIGHT') setDirection('LEFT');
        break;
      case 'RIGHT':
        if (direction !== 'LEFT') setDirection('RIGHT');
        break;
    }
    setActiveButton(newDirection);
    setTimeout(() => setActiveButton(null), 150);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="snake-game">
      <div className="game-header">
        <button className="back-button" onClick={onGoBack}>
          Back
        </button>
        <div className="score">Score: {score}</div>
      </div>

      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="game-canvas"
        />
        {gameOver && (
          <div className="game-over">
            <p>Game Over! Score: {score}</p>
            <button onClick={resetGame}>Play Again</button>
          </div>
        )}
      </div>
      
      <div className="controls">
        <div className="controls-row">
          <button
            className={`control-btn ${activeButton === 'UP' ? 'active' : ''}`}
            onClick={() => handleButtonPress('UP')}
          >
            Up
          </button>
        </div>
        <div className="controls-row">
          <button
            className={`control-btn ${activeButton === 'LEFT' ? 'active' : ''}`}
            onClick={() => handleButtonPress('LEFT')}
          >
            Left
          </button>
          <button
            className={`control-btn ${activeButton === 'RIGHT' ? 'active' : ''}`}
            onClick={() => handleButtonPress('RIGHT')}
          >
            Right
          </button>
        </div>
        <div className="controls-row">
          <button
            className={`control-btn ${activeButton === 'DOWN' ? 'active' : ''}`}
            onClick={() => handleButtonPress('DOWN')}
          >
            Down
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame; 