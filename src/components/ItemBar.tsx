/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, Magnet, MoveHorizontal } from 'lucide-react';
import { ActivePowerUps, ItemInventory, PowerUpType } from '../game/types.ts';

interface ItemBarProps {
  inventory: ItemInventory;
  activePowerUps: ActivePowerUps;
  onUseItem: (type: PowerUpType) => void;
}

export const ItemBar: React.FC<ItemBarProps> = ({
  inventory,
  activePowerUps,
  onUseItem,
}) => {
  const slowSeconds = Math.ceil(activePowerUps.slowTimer / 60);
  const isSlowActive = activePowerUps.slowTimer > 0;
  const isMagnetActive = activePowerUps.magnetCharges > 0;

  const handleClick = (e: React.MouseEvent | React.PointerEvent, type: PowerUpType) => {
    e.stopPropagation();
    onUseItem(type);
  };

  return (
    <div
      className="absolute bottom-5 left-0 right-0 z-20 px-4 flex items-center justify-center gap-2.5 pointer-events-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Slow-motion Clock */}
      <button
        type="button"
        onClick={(e) => handleClick(e, 'slow')}
        disabled={inventory.slow <= 0}
        title="緩速時鐘 (快捷鍵 1)：吊車減速 6 秒"
        className={`pointer-events-auto relative min-h-[48px] flex-1 max-w-[110px] px-2.5 py-2 rounded-2xl border shadow-md backdrop-blur-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
          isSlowActive
            ? 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-300/60'
            : inventory.slow > 0
            ? 'bg-white/90 hover:bg-white text-slate-800 border-slate-200/90 cursor-pointer'
            : 'bg-slate-200/70 text-slate-400 border-slate-300/60 cursor-not-allowed opacity-70'
        }`}
      >
        <Clock className={`w-4 h-4 shrink-0 ${isSlowActive ? 'text-sky-100' : 'text-sky-600'}`} />
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xs font-extrabold whitespace-nowrap">
            {isSlowActive ? `緩速 ${slowSeconds}s` : '緩速'}
          </span>
          <span className={`font-num text-[10px] font-bold ${isSlowActive ? 'text-sky-100' : 'text-slate-500'}`}>
            剩 {inventory.slow}
          </span>
        </div>
      </button>

      {/* Magnetic Alignment */}
      <button
        type="button"
        onClick={(e) => handleClick(e, 'magnet')}
        disabled={inventory.magnet <= 0}
        title="磁吸對齊 (快捷鍵 2)：接下來 2 層自動磁吸對齊"
        className={`pointer-events-auto relative min-h-[48px] flex-1 max-w-[110px] px-2.5 py-2 rounded-2xl border shadow-md backdrop-blur-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
          isMagnetActive
            ? 'bg-violet-600 text-white border-violet-400 ring-2 ring-violet-300/60'
            : inventory.magnet > 0
            ? 'bg-white/90 hover:bg-white text-slate-800 border-slate-200/90 cursor-pointer'
            : 'bg-slate-200/70 text-slate-400 border-slate-300/60 cursor-not-allowed opacity-70'
        }`}
      >
        <Magnet className={`w-4 h-4 shrink-0 ${isMagnetActive ? 'text-violet-100' : 'text-violet-600'}`} />
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xs font-extrabold whitespace-nowrap">
            {isMagnetActive ? `磁吸 x${activePowerUps.magnetCharges}` : '磁吸'}
          </span>
          <span className={`font-num text-[10px] font-bold ${isMagnetActive ? 'text-violet-100' : 'text-slate-500'}`}>
            剩 {inventory.magnet}
          </span>
        </div>
      </button>

      {/* Steel Widen */}
      <button
        type="button"
        onClick={(e) => handleClick(e, 'widen')}
        disabled={inventory.widen <= 0}
        title="鋼骨加寬 (快捷鍵 3)：立即拓寬頂層寬度"
        className={`pointer-events-auto relative min-h-[48px] flex-1 max-w-[110px] px-2.5 py-2 rounded-2xl border shadow-md backdrop-blur-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
          inventory.widen > 0
            ? 'bg-white/90 hover:bg-white text-slate-800 border-slate-200/90 cursor-pointer'
            : 'bg-slate-200/70 text-slate-400 border-slate-300/60 cursor-not-allowed opacity-70'
        }`}
      >
        <MoveHorizontal className="w-4 h-4 shrink-0 text-amber-600" />
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xs font-extrabold whitespace-nowrap">加寬</span>
          <span className="font-num text-[10px] font-bold text-slate-500">
            剩 {inventory.widen}
          </span>
        </div>
      </button>
    </div>
  );
};
