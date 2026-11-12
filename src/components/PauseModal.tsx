/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, HelpCircle, X } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-amber-50 rounded-3xl p-6 shadow-2xl border border-amber-200/80 flex flex-col items-center text-center">
        {/* Header */}
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 shadow-inner">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-stone-800 tracking-tight">遊戲已暫停</h2>
        <p className="text-xs text-stone-500 mt-1 mb-5">給甜點主廚喘口氣的時間～</p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>繼續遊戲</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-white hover:bg-amber-50 text-stone-700 font-bold text-sm rounded-2xl border border-stone-200/80 shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-stone-500" />
            <span>重新開局</span>
          </button>
        </div>

        {/* Audio Controls */}
        <div className="w-full mt-5 pt-4 border-t border-amber-200/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
            <span className="flex items-center gap-1.5">
              {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
              <span>遊戲音效</span>
            </span>
            <button
              onClick={onToggleMute}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                isMuted ? 'bg-stone-200 text-stone-600' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isMuted ? '已靜音' : '開啟中'}
            </button>
          </div>

          {!isMuted && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-amber-600 h-1.5 bg-amber-200 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Gameplay quick tip */}
        <div className="mt-4 p-3 bg-amber-100/60 rounded-xl text-left w-full text-[11px] text-stone-600 leading-relaxed">
          <div className="font-bold text-amber-900 mb-1">🍰 技巧提點</div>
          <div>• 觀察擺錘擺到正中央的慣性時機。</div>
          <div>• 連續 3 次 Perfect 即可恢復甜點寬度！</div>
          <div>• 5 連擊解鎖 🌈 Fever Mode 雙倍得分！</div>
        </div>
      </div>
    </div>
  );
};
