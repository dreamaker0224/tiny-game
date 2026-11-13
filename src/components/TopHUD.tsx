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
  const isNight = stats.height >= 22 || stats.isFever;

  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-3 pb-2 flex items-center justify-between pointer-events-none">
      {/* Left: Score & Floor Height */}
      <div className="flex flex-col gap-0.5 pointer-events-auto">
        <div className="flex items-baseline gap-2">
          <span
            className={`font-num text-2xl font-black tracking-tight drop-shadow-sm ${
              isNight ? 'text-white' : 'text-slate-900'
            }`}
          >
            {stats.score.toLocaleString()}
          </span>
          <span
            className={`font-num text-xs font-bold px-2 py-0.5 rounded-md ${
              isNight ? 'bg-slate-800/80 text-amber-300' : 'bg-white/80 text-slate-700'
            }`}
          >
            {stats.height}F
          </span>
        </div>
        <div
          className={`text-[11px] font-medium ${
            isNight ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          最高紀錄 <span className="font-num font-bold">{bestScore.toLocaleString()}</span>
        </div>
      </div>

      {/* Center: Combo & Fever indicator */}
      <div className="flex flex-col items-center pointer-events-auto">
        {stats.isFever ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 text-white font-extrabold text-xs rounded-full shadow-md">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-200" />
            <span>FEVER x2</span>
            <Sparkles className="w-3 h-3 text-yellow-200" />
          </div>
        ) : stats.currentCombo >= 2 ? (
          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 text-white font-bold text-xs rounded-full shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-100" />
            <span className="font-num">{stats.currentCombo} 連擊</span>
          </div>
        ) : null}
      </div>

      {/* Right: Audio Mute & Pause button */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          title={isMuted ? '開啟音效' : '靜音'}
          className="w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-700 shadow-sm border border-slate-200/70 flex items-center justify-center transition-all active:scale-95 backdrop-blur-xs cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPause();
          }}
          title="暫停遊戲"
          className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Pause className="w-4 h-4 fill-current" />
        </button>
      </div>
    </header>
  );
};
