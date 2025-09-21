"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import gameQuestions from "../../data/gameQuestions";
import {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Mouse,
  MouseConstraint,
  Composite,
} from "matter-js";
import * as Matter from "matter-js";

interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isDragging: boolean;
  isPlaced: boolean;
  physicsBody?: Matter.Body;
}

interface Question {
  question: string;
  answer: string;
  options: string[];
}

interface BlockType {
  width: number;
  height: number;
  color: string;
}

const GAME_AREA_HEIGHT = 500;
const GAME_AREA_WIDTH = 600;
const GROUND_HEIGHT = 50;
const GROUND_Y = GAME_AREA_HEIGHT - GROUND_HEIGHT;

const blockTypes: BlockType[] = [
  { width: 80, height: 40, color: "#FF6B6B" },
  { width: 100, height: 30, color: "#4ECDC4" },
  { width: 60, height: 50, color: "#45B7D1" },
  { width: 120, height: 35, color: "#96CEB4" },
  { width: 90, height: 45, color: "#FFEAA7" },
];

export default function TowerGame(): JSX.Element {
  const [questions] = useState<Question[]>(
    gameQuestions[0].questions.map((q: any) => ({
      question: q.question,
      answer: q.answer,
      options: q.options,
    }))
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [isPhysicsActive, setIsPhysicsActive] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);

  const currentQuestion: Question = questions[currentQuestionIndex];

  // === TIMER LOGIC ===
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  // Sync physics bodies with React state
  useEffect(() => {
    if (!engineRef.current || !isPhysicsActive) return;

    const updatePositions = () => {
      setBlocks((prevBlocks) =>
        prevBlocks.map((block) => {
          if (block.physicsBody) {
            return {
              ...block,
              x: block.physicsBody.position.x - block.width / 2,
              y: block.physicsBody.position.y - block.height / 2,
            };
          }
          return block;
        })
      );
    };

    // Update positions every frame
    const intervalId = setInterval(updatePositions, 16); // ~60fps

    return () => clearInterval(intervalId);
  }, [isPhysicsActive]);

  //BLOCK LOGIC
  const generateBlock = useCallback((): Block => {
    const blockType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
    return {
      id: Date.now().toString(),
      x: GAME_AREA_WIDTH / 2 - blockType.width / 2,
      y: 20, // Position at top of screen
      width: blockType.width,
      height: blockType.height,
      color: blockType.color,
      isDragging: false,
      isPlaced: false,
    };
  }, []);

  // Handle mouse events for dragging blocks
  const handleMouseDown = (e: React.MouseEvent, block: Block) => {
    if (block.isPlaced) return;

    setCurrentBlock({ ...block, isDragging: true });
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!currentBlock || !currentBlock.isDragging || !gameAreaRef.current)
        return;

      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - currentBlock.width / 2;
      const y = e.clientY - rect.top - currentBlock.height / 2;

      setCurrentBlock((prev) => (prev ? { ...prev, x, y } : null));
    },
    [currentBlock]
  );

  const handleMouseUp = useCallback(() => {
    if (!currentBlock || !currentBlock.isDragging || !engineRef.current) return;

    // Ensure the block is within bounds
    const clampedX = Math.max(
      currentBlock.width / 2,
      Math.min(
        currentBlock.x + currentBlock.width / 2,
        GAME_AREA_WIDTH - currentBlock.width / 2
      )
    );
    const clampedY = Math.max(
      currentBlock.height / 2,
      Math.min(
        currentBlock.y + currentBlock.height / 2,
        GAME_AREA_HEIGHT - currentBlock.height / 2
      )
    );

    // Create physics body at the current position (invisible - React will handle rendering)
    const physicsBody = Bodies.rectangle(
      clampedX,
      clampedY,
      currentBlock.width,
      currentBlock.height,
      {
        friction: 0.8,
        frictionStatic: 0.5,
        frictionAir: 0.01,
        restitution: 0.3,
        density: 0.001,
        render: {
          visible: false, // Hide Matter.js rendering
        },
      }
    );

    World.add(engineRef.current.world, physicsBody);

    const placedBlock: Block = {
      ...currentBlock,
      x: clampedX - currentBlock.width / 2,
      y: clampedY - currentBlock.height / 2,
      physicsBody,
      isPlaced: true,
      isDragging: false,
    };

    setBlocks((prev) => [...prev, placedBlock]);
    setCurrentBlock(null);
    setIsPhysicsActive(true);
  }, [currentBlock]);

  // Add event listeners for mouse events
  useEffect(() => {
    if (currentBlock && currentBlock.isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [currentBlock, handleMouseMove, handleMouseUp]);

  const handleAnswerSubmit = (): void => {
    if (!selectedAnswer) return;
    const correct = selectedAnswer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore((prev) => prev + 1);
      const newBlock = generateBlock();
      setCurrentBlock(newBlock);
    }
  };

  const handleNextQuestion = (): void => {
    setCurrentQuestionIndex((prev) =>
      prev < questions.length - 1 ? prev + 1 : 0
    );
    setSelectedAnswer("");
    setShowResult(false);
  };

  const resetGame = (): void => {
    if (engineRef.current) {
      const bodiesToRemove = engineRef.current.world.bodies.filter(
        (b) => !b.isStatic
      );
      World.remove(engineRef.current.world, bodiesToRemove);
    }
    setBlocks([]);
    setCurrentBlock(null);
    setScore(0);
    setGameOver(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setShowResult(false);
    setIsPhysicsActive(false);
    startTimer(); // Restart the timer
  };

  // === ENGINE SETUP ===
  useEffect(() => {
    if (!gameAreaRef.current) return;

    const engine: Matter.Engine = Engine.create();
    engine.world.gravity.y = 0.8;

    engineRef.current = engine;

    const render: Matter.Render = Render.create({
      element: gameAreaRef.current,
      engine,
      options: {
        width: GAME_AREA_WIDTH,
        height: GAME_AREA_HEIGHT,
        wireframes: false,
        background: "transparent",
        showVelocity: false,
        showAngleIndicator: false,
      },
    });
    renderRef.current = render;

    const runner: Matter.Runner = Runner.create();
    runnerRef.current = runner;

    const ground: Matter.Body = Bodies.rectangle(
      GAME_AREA_WIDTH / 2,
      GAME_AREA_HEIGHT - GROUND_HEIGHT / 2,
      GAME_AREA_WIDTH,
      GROUND_HEIGHT,
      { isStatic: true, render: { fillStyle: "#8B4513" } }
    );

    const leftWall = Bodies.rectangle(
      -25,
      GAME_AREA_HEIGHT / 2,
      50,
      GAME_AREA_HEIGHT,
      { isStatic: true, render: { visible: false } }
    );
    const rightWall = Bodies.rectangle(
      GAME_AREA_WIDTH + 25,
      GAME_AREA_HEIGHT / 2,
      50,
      GAME_AREA_HEIGHT,
      { isStatic: true, render: { visible: false } }
    );

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    mouseConstraintRef.current = mouseConstraint;
    Composite.add(engine.world, mouseConstraint);

    // @ts-ignore
    render.mouse = mouse;

    Render.run(render);
    Runner.run(runner, engine);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Main Game Area */}
      <div className="flex-1 bg-white rounded-l-3xl p-8">
        <div className="max-w-6xl mx-auto">
          {gameOver && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                <h2 className="text-3xl font-bold text-red-600 mb-4">
                  Game Over!
                </h2>
                <p className="text-gray-700 mb-6">Time's up!</p>
                <button
                  onClick={resetGame}
                  className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-8">
            {/* Question Panel */}
            <div className="flex-1">
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Question {currentQuestionIndex + 1}
                </h2>
                <p className="text-lg font-medium text-gray-700 mb-6">
                  {currentQuestion.question}
                </p>

                {!showResult && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedAnswer(option)}
                        className={`w-full p-4 text-left rounded-lg border-1 transition-all text-gray-700 ${
                          selectedAnswer === option
                            ? "border-purple-500 bg-purple-50 text-purple-800"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!selectedAnswer}
                      className={`w-full mt-4 py-3 rounded-lg font-semibold transition-colors ${
                        selectedAnswer
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Submit Answer
                    </button>
                  </div>
                )}

                {showResult && (
                  <div
                    className={`p-4 rounded-lg ${
                      isCorrect
                        ? "bg-green-100 border border-green-300"
                        : "bg-red-100 border border-red-300"
                    }`}
                  >
                    <span
                      className={`text-lg font-semibold ${
                        isCorrect ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {isCorrect
                        ? "✓ Correct! You earned a block!"
                        : "✗ Incorrect."}
                    </span>
                    {!isCorrect && (
                      <p className="mt-2 text-sm text-gray-700">
                        Correct answer:{" "}
                        <span className="font-mono">
                          {currentQuestion.answer}
                        </span>
                      </p>
                    )}
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={handleNextQuestion}
                        className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        {isCorrect ? "Next Question" : "Next Question"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Game Canvas */}
            <div className="flex-1">
              <div className="bg-gradient-to-b from-sky-300 to-green-300 rounded-2xl overflow-hidden relative">
                <div
                  ref={gameAreaRef}
                  className="relative"
                  style={{ width: GAME_AREA_WIDTH, height: GAME_AREA_HEIGHT }}
                >
                  {/* TIMER */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md font-bold z-10">
                    Time Left: {timeLeft}s
                  </div>

                  {/* Score */}
                  <div className="absolute x-2 y-3 text-white px-3 py-1 rounded-md font-bold z-10">
                    Score: {score} Blocks
                  </div>

                  {/* Show all placed blocks as React overlays */}
                  {blocks
                    .filter((block) => block.isPlaced)
                    .map((block) => (
                      <div
                        key={block.id}
                        className="absolute border-2 border-black pointer-events-none"
                        style={{
                          left: block.x,
                          top: block.y,
                          width: block.width,
                          height: block.height,
                          backgroundColor: block.color,
                          zIndex: 15,
                        }}
                      />
                    ))}

                  {/* Draggable block overlay */}
                  {currentBlock && !currentBlock.isPlaced && (
                    <div
                      className="absolute cursor-grab active:cursor-grabbing border-2 border-black"
                      style={{
                        left: currentBlock.x,
                        top: currentBlock.y,
                        width: currentBlock.width,
                        height: currentBlock.height,
                        backgroundColor: currentBlock.color,
                        zIndex: 20,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, currentBlock)}
                    ></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
