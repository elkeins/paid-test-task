import React from 'react';
import TacticsBoard from './tactics/TacticsBoard';

/**
 * AppLayout — main application shell.
 * 
 * Structure:
 * - Fixed header with branding and instructions
 * - TacticsBoard fills the remaining viewport height
 *   (includes its own sidebar for formation management)
 */
const AppLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 shadow-sm shrink-0 z-10">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight tracking-tight">
                Tactics Board
              </h1>
              <p className="text-[11px] text-gray-400 leading-none">
                Soccer Formation Planner
              </p>
            </div>
          </div>

          {/* Right side hints */}
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 9l4 4L19 3" />
              </svg>
              <span>11v11 formations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span>Save & load</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Drag to move</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content — TacticsBoard fills remaining height */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <TacticsBoard />
      </main>
    </div>
  );
};

export default AppLayout;
