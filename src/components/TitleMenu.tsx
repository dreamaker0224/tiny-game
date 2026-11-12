/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Sparkles, Volume2, VolumeX, Trophy } from 'lucide-react';

interface TitleMenuProps {
  onStart: () => void;
  bestScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  onStart,
  bestScore,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-amber-50 via-orange-50/60 to-amber-100 flex flex-col items-center justify-between p-6 text-center select-none">
      {/* Top bar with audio toggle */}
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/60 px-3 py-1 rounded-full">
          <Trophy className="w-3.5 h-3.5 text-amber-700" />
          <span>最佳：{bestScore.toLocaleString()}</span>
        </div>

        <button
          onClick={onToggleMute}
          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-700 shadow-sm border border-stone-200/60 flex items-center justify-center transition-all active:scale-95"
          title={isMuted ? '開啟音效' : '靜音'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
        </button>
      </div>

      {/* Hero Dessert Illustration & Title */}
      <div className="flex flex-col items-center my-auto">
        {/* Animated Stack Mascot */}
        <div className="relative mb-5 animate-soft-bounce">
          <div className="w-24 h-24 rounded-full bg-amber-200/50 flex items-center justify-center shadow-inner">
            <span className="text-5xl drop-shadow-md">🥞</span>
          </div>
          <span className="absolute -top-1 -right-2 text-2xl animate-spin" style={{ animationDuration: '6s' }}>
            ✨
          </span>
          <span className="absolute -bottom-1 -left-2 text-2xl">
            🍓
          </span>
        </div>

        <h1 className="text-3xl font-black text-amber-950 tracking-tight flex items-center justify-center gap-1.5">
          <span>甘味疊疊樂</span>
        </h1>
        <div className="text-xs font-bold tracking-widest text-amber-700 uppercase mt-1">
          Sweet Stack Fever
        </div>
        <p className="text-xs text-stone-600 mt-2 max-w-[240px] leading-relaxed">
          把握頂部擺鐘搖擺時機，落下甜點層層高疊！精準切除邊界，解鎖狂熱彩虹模式！
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 mt-6 w-full max-w-[280px]">
          <div className="bg-white/80 rounded-2xl p-2.5 border border-amber-200/60 flex flex-col items-center">
            <span className="text-lg">⏰</span>
            <span className="text-[11px] font-bold text-stone-800 mt-1">擺鐘律動</span>
            <span className="text-[9px] text-stone-500">時機釋放</span>
          </div>
          <div className="bg-white/80 rounded-2xl p-2.5 border border-amber-200/60 flex flex-col items-center">
            <span className="text-lg">✂️</span>
            <span className="text-[11px] font-bold text-stone-800 mt-1">物理切除</span>
            <span className="text-[9px] text-stone-500">碎屑掉落</span>
          </div>
          <div className="bg-white/80 rounded-2xl p-2.5 border border-amber-200/60 flex flex-col items-center">
            <span className="text-lg">🌈</span>
            <span className="text-[11px] font-bold text-stone-800 mt-1">狂熱連擊</span>
            <span className="text-[9px] text-stone-500">寬度加寬</span>
          </div>
        </div>
      </div>

      {/* Start Button & Footer */}
      <div className="w-full flex flex-col items-center gap-3">
        <button
          onClick={onStart}
          className="w-full max-w-[280px] py-3.5 px-6 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-600/30 transition-all active:scale-98 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
          <span>開始堆疊甜點塔</span>
        </button>

        <span className="text-[11px] text-stone-400">
          支援手機單指觸控與電腦滑鼠點擊
        </span>
      </div>
    </div>
  );
};
