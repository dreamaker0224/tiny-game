/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PhoneFrame } from './components/PhoneFrame.tsx';
import { GameCanvas } from './game/GameCanvas.tsx';
import { TopHUD } from './components/TopHUD.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';
import { TitleMenu } from './components/TitleMenu.tsx';
import { GameState, GameStats } from './game/types.ts';
import { soundManager } from './audio/soundManager.ts';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [volume, setVolume] = useState<number>(soundManager.getVolume());
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // High score tracking
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem('sweet_stack_best_score');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  // Current live stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    height: 0,
    perfectCount: 0,
    maxCombo: 0,
    currentCombo: 0,
    isFever: false,
    feverTimer: 0,
  });

  // Audio handlers
  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted;
    soundManager.setMuted(newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((vol: number) => {
    soundManager.setVolume(vol);
    setVolume(vol);
  }, []);

  // Game control handlers
  const handleStartGame = useCallback(() => {
    soundManager.playTap();
    setIsPaused(false);
    setIsNewRecord(false);
    setGameState('PLAYING');
  }, []);

  const handlePause = useCallback(() => {
    if (gameState === 'PLAYING') {
      soundManager.playTap();
      setIsPaused(true);
    }
  }, [gameState]);

  const handleResume = useCallback(() => {
    soundManager.playTap();
    setIsPaused(false);
  }, []);

  const handleRestart = useCallback(() => {
    soundManager.playTap();
    setIsPaused(false);
    setIsNewRecord(false);
    setGameState('PLAYING');
  }, []);

  const handleGameOver = useCallback((finalStats: GameStats) => {
    setStats(finalStats);
    setGameState('GAME_OVER');

    // Check high score
    if (finalStats.score > bestScore) {
      setBestScore(finalStats.score);
      setIsNewRecord(true);
      localStorage.setItem('sweet_stack_best_score', finalStats.score.toString());
    } else {
      setIsNewRecord(false);
    }
  }, [bestScore]);

  const handleUpdateStats = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState === 'PLAYING') {
          if (isPaused) handleResume();
          else handlePause();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isPaused, handlePause, handleResume, handleToggleMute]);

  return (
    <PhoneFrame>
      {/* 2D Canvas Game Engine */}
      <GameCanvas
        gameState={gameState}
        isPaused={isPaused}
        onGameOver={handleGameOver}
        onUpdateStats={handleUpdateStats}
      />

      {/* Top HUD (active during PLAYING or when PAUSED) */}
      {gameState === 'PLAYING' && (
        <TopHUD
          stats={stats}
          bestScore={bestScore}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
        />
      )}

      {/* Welcome Title Menu */}
      {gameState === 'MENU' && (
        <TitleMenu
          onStart={handleStartGame}
          bestScore={bestScore}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Pause Modal */}
      <PauseModal
        isOpen={isPaused && gameState === 'PLAYING'}
        onResume={handleResume}
        onRestart={handleRestart}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        volume={volume}
        onVolumeChange={handleVolumeChange}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={gameState === 'GAME_OVER'}
        stats={stats}
        bestScore={bestScore}
        isNewRecord={isNewRecord}
        onRestart={handleRestart}
      />
    </PhoneFrame>
  );
}
