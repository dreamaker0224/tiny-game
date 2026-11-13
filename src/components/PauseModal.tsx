/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, HardHat } from 'lucide-react';

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
    <div
      className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col items-center text-center">
        {/* Header */}
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 shadow-inner">
          <HardHat className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">施工暫停中</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">休息一下，隨時繼續蓋出高樓！</p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>繼續蓋樓</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>重新施工</span>
          </button>
        </div>

        {/* Audio Controls */}
        <div className="w-full mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
              <span>遊戲音效</span>
            </span>
            <button
              onClick={onToggleMute}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                isMuted ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-800'
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
                className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Gameplay tips */}
        <div className="mt-4 p-3 bg-sky-50/80 border border-sky-100 rounded-xl text-left w-full text-[11px] text-slate-600 leading-relaxed">
          <div className="font-bold text-slate-800 mb-1">🏗️ 建築攻略</div>
          <div>• 每 5 樓出現道具樓層，成功堆疊即可獲得！</div>
          <div>• 連續 4 次 Perfect 也會隨機獲贈道具！</div>
          <div>• 5 連擊啟動 🌈 摩天狂熱雙倍得分！</div>
        </div>
      </div>
    </div>
  );
};
