/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RotateCcw, Share2, Award, Sparkles, Check } from 'lucide-react';
import { GameStats } from '../game/types.ts';
import confetti from 'canvas-confetti';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  bestScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  bestScore,
  isNewRecord,
  onRestart,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isNewRecord && stats.score > 0) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#FBBF24'],
          });
        } catch {
          // Fallback if confetti fails
        }
      }
    }
  }, [isOpen, isNewRecord, stats.score]);

  if (!isOpen) return null;

  // Determine Baker Rank Title
  const getRank = (height: number) => {
    if (height < 5) return { title: '初級甜點見習生', badge: '🍰', desc: '手感漸入佳境，再接再厲！' };
    if (height < 12) return { title: '街角烘焙名手', badge: '🥞', desc: '掌握了擺動的節奏，非常厲害！' };
    if (height < 22) return { title: '人氣甜點名師', badge: '🍮', desc: '驚人的平衡感與專注力！' };
    if (height < 35) return { title: '星級糕點大師', badge: '🎂', desc: '甜點塔高聳入雲，令人驚嘆！' };
    return { title: '傳說級甜點仙人', badge: '👑', desc: '神乎其技！無懈可擊的堆疊境界！' };
  };

  const rank = getRank(stats.height);

  const handleShare = () => {
    const text = `🍰 我在《甘味疊疊樂》堆疊了 ${stats.height} 層甜點塔！獲得 ${stats.score.toLocaleString()} 分（稱號：${rank.title} ${rank.badge}）！你能疊得比我高嗎？`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-stone-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-xs bg-amber-50 rounded-3xl p-6 shadow-2xl border-2 border-amber-300 flex flex-col items-center text-center">
        {/* Record Badge */}
        {isNewRecord && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black rounded-full mb-3 shadow-md animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>新紀錄達成！</span>
          </div>
        )}

        {/* Title & Icon */}
        <div className="text-4xl mb-1">{rank.badge}</div>
        <h2 className="text-xl font-black text-amber-950 tracking-tight">{rank.title}</h2>
        <p className="text-xs text-stone-500 mt-0.5 mb-4">{rank.desc}</p>

        {/* Score & Height Big Showcase */}
        <div className="w-full bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs mb-4">
          <div className="text-xs font-medium text-stone-400">本次最終得分</div>
          <div className="font-num text-3xl font-black text-amber-900 my-0.5 tracking-tight">
            {stats.score.toLocaleString()}
          </div>
          <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
            <div>
              塔高 <span className="font-num font-bold text-amber-800">{stats.height}</span> 層
            </div>
            <div className="w-px h-3 bg-stone-200" />
            <div>
              高度約 <span className="font-num font-bold text-amber-800">{stats.height * 4}</span> cm
            </div>
          </div>
        </div>

        {/* Detailed Stats Row */}
        <div className="w-full grid grid-cols-2 gap-2 mb-5">
          <div className="bg-amber-100/50 rounded-xl p-2.5 border border-amber-200/50">
            <div className="text-[11px] text-stone-500 font-medium">完美對齊 (Perfect)</div>
            <div className="font-num font-bold text-stone-800 text-base">{stats.perfectCount} 次</div>
          </div>
          <div className="bg-amber-100/50 rounded-xl p-2.5 border border-amber-200/50">
            <div className="text-[11px] text-stone-500 font-medium">最高連擊 (Combo)</div>
            <div className="font-num font-bold text-stone-800 text-base">{stats.maxCombo} 連</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再玩一局</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full py-2.5 px-4 bg-white hover:bg-amber-50 text-stone-700 font-bold text-sm rounded-2xl border border-stone-200/80 shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">已複製戰績到剪貼簿！</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-stone-500" />
                <span>分享甜點塔戰績</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
