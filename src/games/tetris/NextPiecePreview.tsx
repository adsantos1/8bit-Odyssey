

// src/games/NextPiecePreview.tsx
import React, { useEffect, useRef } from 'react';
import { PieceData } from './TetrisGame'; // Assuming PieceData is exported or defined centrally
import { COLORS } from './TetrisGame'; // Import shared colors
import './NextPiecePreview.css';

// Constants for the preview canvas
const PREVIEW_COLS = 4; // Max width/height of a tetromino is 4
const PREVIEW_ROWS = 4;
const PREVIEW_BLOCK_SIZE = 15; // Smaller blocks for preview
const PREVIEW_WIDTH = PREVIEW_COLS * PREVIEW_BLOCK_SIZE;
const PREVIEW_HEIGHT = PREVIEW_ROWS * PREVIEW_BLOCK_SIZE;

interface NextPiecePreviewProps {
  pieceData: PieceData | null;
}

const NextPiecePreview: React.FC<NextPiecePreviewProps> = ({ pieceData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context || !canvas) return;

    // Clear canvas
    context.fillStyle = '#222'; // Dark background for preview
    context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

    if (pieceData) {
      const shape = pieceData.tetromino;
      const color = COLORS[pieceData.color] || '#fff'; // Get color string

      // Calculate offsets to center the piece in the 4x4 grid
      // Find actual bounds of the piece shape
      let minX = PREVIEW_COLS, minY = PREVIEW_ROWS, maxX = -1, maxY = -1;
      shape.forEach((row: number[], y: number) => {
        row.forEach((value: number, x: number) => {
              if (value !== 0) {
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
              }
          });
      });
      const pieceWidth = maxX - minX + 1;
      const pieceHeight = maxY - minY + 1;

      // Center based on actual shape size
      const offsetX = Math.floor((PREVIEW_COLS - pieceWidth) / 2);
      const offsetY = Math.floor((PREVIEW_ROWS - pieceHeight) / 2);


      // Draw the piece
      context.fillStyle = color;
      shape.forEach((row: number[], y: number) => {
        row.forEach((value: number, x: number) => {
          if (value !== 0) {
             // Draw relative to top-left of shape, adjusted by offset
             const drawX = x - minX + offsetX;
             const drawY = y - minY + offsetY;

             context.fillRect(
               drawX * PREVIEW_BLOCK_SIZE,
               drawY * PREVIEW_BLOCK_SIZE,
               PREVIEW_BLOCK_SIZE,
               PREVIEW_BLOCK_SIZE
             );
             // Optional: Add small border
             context.strokeStyle = '#111';
             context.lineWidth = 1;
             context.strokeRect(
                drawX * PREVIEW_BLOCK_SIZE,
                drawY * PREVIEW_BLOCK_SIZE,
                PREVIEW_BLOCK_SIZE,
                PREVIEW_BLOCK_SIZE
             );
          }
        });
      });
    }
  }, [pieceData]); // Redraw when pieceData changes

  return (
    <div className="next-piece-container">
      <canvas
        ref={canvasRef}
        width={PREVIEW_WIDTH}
        height={PREVIEW_HEIGHT}
        className="next-piece-canvas"
      />
    </div>
  );
};

export default NextPiecePreview;

// --- Make sure PieceData type is accessible ---
// Option 1: Export it from TetrisGame.tsx
// export type TetrominoShape = number[][];
// export interface PieceData { shape: TetrominoShape; color: number; }

// Option 2: Define it in a separate types file and import in both places