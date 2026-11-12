/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pause, Volume2, VolumeX, Sparkles, Flame } from 'lucide-react';
import { GameStats } from '../game/types.ts';

interface TopHUDProps {
  stats: GameStats;
  bestScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  stats,
  bestScore,
  isMuted,
  onToggleMute,
  onPause,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-3 pb-2 flex items-center justify-between pointer-events-none">
      {/* Left: Score & Floor Height */}
      <div className="flex flex-col gap-0.5 pointer-events-auto">
        <div className="flex items-baseline gap-2">
          <span className="font-num text-2xl font-black text-amber-950 tracking-tight drop-shadow-sm">
            {stats.score.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-amber-800/80 bg-amber-100/90 px-2 py-0.5 rounded-full backdrop-blur-xs">
            {stats.height} 層
          </span>
        </div>
        <div className="text-[11px] font-medium text-amber-800/70">
          最高紀錄 <span className="font-num font-bold">{bestScore.toLocaleString()}</span>
        </div>
      </div>

      {/* Center: Combo & Fever indicator badge */}
      <div className="flex flex-col items-center pointer-events-auto">
        {stats.isFever ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-pink-500 via-amber-400 to-indigo-500 text-white font-extrabold text-xs rounded-full shadow-md animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-200" />
            <span>FEVER x2</span>
            <Sparkles className="w-3 h-3 text-yellow-200 animate-spin" />
          </div>
        ) : stats.currentCombo >= 2 ? (
          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 text-white font-bold text-xs rounded-full shadow-xs animate-bounce">
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span>{stats.currentCombo} 連擊!</span>
          </div>
        ) : null}
      </div>

      {/* Right: Audio Mute & Pause button */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onToggleMute}
          title={isMuted ? '開啟音效' : '靜音'}
          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-700 shadow-sm border border-stone-200/60 flex items-center justify-center transition-all active:scale-95 backdrop-blur-xs"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
        </button>

        <button
          onClick={onPause}
          title="暫停遊戲"
          className="w-9 h-9 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center justify-center transition-all active:scale-95"
        >
          <Pause className="w-4 h-4 fill-current" />
        </button>
      </div>
    </header>
  );
};
