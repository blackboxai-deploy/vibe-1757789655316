"use client";

import { useState, useEffect, useRef } from "react";

const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const SNAKE_SPEED = 100; // in ms

type SnakeSegment = {
  x: number;
  y: number;
};

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState<SnakeSegment[]>([
    { x: 10, y: 10 },
  ]);
  const [food, setFood] = useState<SnakeSegment>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<string>("RIGHT");
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);

  useEffect(() => {
    const storedHighScore = localStorage.getItem("snakeHighScore");
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (gameOver) {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("snakeHighScore", score.toString());
      }
      return;
    }

    const gameInterval = setInterval(moveSnake, SNAKE_SPEED);

    return () => clearInterval(gameInterval);
  }, [snake, gameOver, highScore, score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? "green" : "lime";
      ctx.fillRect(
        segment.x * GRID_SIZE,
        segment.y * GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE
      );
    });
  }, [snake, food, gameOver]);

  const generateFood = () => {
    let newFoodPosition;
    do {
      newFoodPosition = {
        x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
      };
    } while (
      snake.some(
        (segment) =>
          segment.x === newFoodPosition.x && segment.y === newFoodPosition.y
      )
    );
    setFood(newFoodPosition);
  };

  const moveSnake = () => {
    if (gameOver) return;

    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      // Wall collision
      if (
        head.x < 0 ||
        head.x >= CANVAS_WIDTH / GRID_SIZE ||
        head.y < 0 ||
        head.y >= CANVAS_HEIGHT / GRID_SIZE
      ) {
        setGameOver(true);
        return prevSnake;
      }

      // Self collision
      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          setGameOver(true);
          return prevSnake;
        }
      }

      newSnake.unshift(head);

      // Food collision
      if (head.x === food.x && head.y === food.y) {
        setScore((prevScore) => prevScore + 1);
        generateFood();
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  };

  const restartGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection("RIGHT");
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-4">Snake Game</h1>
      <div className="flex gap-8 mb-4">
        <p className="text-xl">Score: {score}</p>
        <p className="text-xl">High Score: {highScore}</p>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-black border-2 border-gray-600 rounded-lg"
        ></canvas>
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded-lg">
            <h2 className="text-3xl font-bold text-red-500">Game Over</h2>
            <p className="text-lg mt-2">Your score: {score}</p>
            <button
              onClick={restartGame}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
            >
              Restart
            </button>
          </div>
        )}
      </div>
      <div className="mt-4 text-center text-gray-400">
        <p>Use Arrow Keys to move</p>
      </div>
    </div>
  );
}