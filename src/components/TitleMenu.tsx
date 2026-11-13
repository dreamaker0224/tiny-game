/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Volume2, VolumeX, Trophy, Building2 } from 'lucide-react';

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
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 flex flex-col items-center justify-between p-6 text-center select-none">
      {/* Top bar with best score & audio toggle */}
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-num">最佳 {bestScore.toLocaleString()}</span>
        </div>

        <button
          onClick={onToggleMute}
          className="w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-700 shadow-xs border border-slate-200/80 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title={isMuted ? '開啟音效' : '靜音'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
        </button>
      </div>

      {/* Hero House Building Illustration & Title */}
      <div className="flex flex-col items-center my-auto">
        <div className="relative mb-5 animate-soft-bounce">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-white">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <span className="absolute -top-2 -right-2 text-2xl">🏗️</span>
          <span className="absolute -bottom-1 -left-2 text-2xl">🏠</span>
        </div>

        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          疊疊樂
        </h1>
        <p className="text-xs text-slate-600 mt-2.5 max-w-[250px] leading-relaxed">
          操控頂部吊車把握時機落下樓層，精準對齊蓋出摩天大樓！善用道具突破極限高度！
        </p>

        {/* Power-up Showcase */}
        <div className="grid grid-cols-3 gap-2 mt-6 w-full max-w-[290px]">
          <div className="bg-white/85 rounded-2xl p-2.5 border border-slate-200/80 flex flex-col items-center shadow-xs">
            <span className="text-lg">⏱️</span>
            <span className="text-[11px] font-bold text-slate-800 mt-1">緩速時鐘</span>
            <span className="text-[10px] text-slate-500">擺動減速</span>
          </div>
          <div className="bg-white/85 rounded-2xl p-2.5 border border-slate-200/80 flex flex-col items-center shadow-xs">
            <span className="text-lg">🧲</span>
            <span className="text-[11px] font-bold text-slate-800 mt-1">磁吸對齊</span>
            <span className="text-[10px] text-slate-500">自動校正</span>
          </div>
          <div className="bg-white/85 rounded-2xl p-2.5 border border-slate-200/80 flex flex-col items-center shadow-xs">
            <span className="text-lg">🏗️</span>
            <span className="text-[11px] font-bold text-slate-800 mt-1">鋼骨加寬</span>
            <span className="text-[10px] text-slate-500">拓寬樓面</span>
          </div>
        </div>
      </div>

      {/* Start Button & Footer */}
      <div className="w-full flex flex-col items-center gap-3 pb-2">
        <button
          onClick={onStart}
          className="w-full max-w-[290px] py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-500/25 transition-all active:scale-98 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
          <span>開始蓋房子</span>
        </button>

        <span className="text-[11px] text-slate-500">
          點擊畫面或空白鍵落下樓層 · 1/2/3 鍵使用道具
        </span>
      </div>
    </div>
  );
};
