/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RotateCcw, Share2, Sparkles, Check } from 'lucide-react';
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
  isNewRecord,
  onRestart,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && isNewRecord && stats.score > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#0EA5E9', '#8B5CF6', '#10B981', '#FBBF24'],
        });
      } catch {
        // Fallback if confetti fails
      }
    }
  }, [isOpen, isNewRecord, stats.score]);

  if (!isOpen) return null;

  const getRank = (height: number) => {
    if (height < 5) return { title: '工地實習生', badge: '🧱', desc: '打好基礎，下次一定能蓋得更高！' };
    if (height < 12) return { title: '街區營造師', badge: '🏡', desc: '已經掌握吊車節奏，表現不錯！' };
    if (height < 22) return { title: '都會建築師', badge: '🏢', desc: '出色的空間平衡感與穩定度！' };
    if (height < 35) return { title: '摩天大樓大師', badge: '🏙️', desc: '高樓直入雲霄，令人驚嘆的傑作！' };
    return { title: '天際線傳奇', badge: '👑', desc: '登峰造極！都市天際線因你而閃耀！' };
  };

  const rank = getRank(stats.height);

  const handleShare = () => {
    const text = `🏢 我在《疊疊樂》蓋出了 ${stats.height} 層大樓（約 ${stats.height * 3} 公尺）！獲得 ${stats.score.toLocaleString()} 分（稱號：${rank.title} ${rank.badge}）！你能蓋得比我高嗎？`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border-2 border-amber-300 flex flex-col items-center text-center">
        {/* Record Badge */}
        {isNewRecord && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-full mb-3 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>新紀錄達成！</span>
          </div>
        )}

        <div className="text-4xl mb-1">{rank.badge}</div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{rank.title}</h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-4">{rank.desc}</p>

        {/* Score & Height Showcase */}
        <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-4">
          <div className="text-xs font-medium text-slate-500">本次最終得分</div>
          <div className="font-num text-3xl font-black text-slate-900 my-0.5 tracking-tight">
            {stats.score.toLocaleString()}
          </div>
          <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
            <div>
              樓層 <span className="font-num font-bold text-amber-600">{stats.height}</span> 層
            </div>
            <div className="w-px h-3 bg-slate-300" />
            <div>
              高度約 <span className="font-num font-bold text-amber-600">{stats.height * 3}</span> m
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="w-full grid grid-cols-2 gap-2 mb-5">
          <div className="bg-sky-50/70 rounded-xl p-2.5 border border-sky-100">
            <div className="text-[11px] text-slate-500 font-medium">完美對齊</div>
            <div className="font-num font-bold text-slate-800 text-base">{stats.perfectCount} 次</div>
          </div>
          <div className="bg-sky-50/70 rounded-xl p-2.5 border border-sky-100">
            <div className="text-[11px] text-slate-500 font-medium">最高連擊</div>
            <div className="font-num font-bold text-slate-800 text-base">{stats.maxCombo} 連</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再蓋一棟</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">已複製戰績到剪貼簿！</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-500" />
                <span>分享大樓戰績</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
