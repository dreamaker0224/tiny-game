/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="w-full h-screen min-h-[100dvh] bg-slate-900 sm:bg-gradient-to-br sm:from-sky-100 sm:via-slate-100 sm:to-amber-50 flex items-center justify-center p-0 sm:p-4 select-none overflow-hidden">
      {/* Mobile Frame Container */}
      <div className="relative w-full h-full sm:w-[390px] sm:h-[800px] sm:max-h-[92vh] sm:rounded-[48px] bg-sky-50 shadow-none sm:shadow-[0_25px_60px_-15px_rgba(15,23,42,0.32),0_0_0_12px_#1E293B,0_0_0_14px_#334155] overflow-hidden flex flex-col">
        {/* Top Speaker & Front Camera Notch (Desktop Preview) */}
        <div className="hidden sm:flex absolute top-0 left-0 right-0 h-6 items-center justify-center z-30 pointer-events-none">
          <div className="w-24 h-4 bg-stone-900 rounded-b-xl flex items-center justify-center gap-2 px-3">
            <div className="w-8 h-1 bg-stone-700 rounded-full" />
            <div className="w-2 h-2 bg-stone-800 rounded-full border border-stone-700" />
          </div>
        </div>

        {/* Game Canvas & Overlay Screen Area */}
        <div className="relative w-full h-full flex-1 flex flex-col overflow-hidden">
          {children}
        </div>

        {/* Bottom Home Indicator Bar (Desktop Preview) */}
        <div className="hidden sm:flex absolute bottom-1.5 left-0 right-0 h-4 items-center justify-center z-30 pointer-events-none">
          <div className="w-32 h-1 bg-stone-800/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};
