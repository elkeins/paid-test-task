import React, { useState, useRef, useCallback, useEffect } from 'react';
import SoccerField from './SoccerField';
import PlayerToken from './PlayerToken';
import FormationManager from './FormationManager';
import {
  Player,
  FIELD,
  PLAYER_RADIUS,
  SNAP_GRID,
  getDefaultPlayers,
} from '@/types/tactics';

/**
 * TacticsBoard — the main interactive component.
 * 
 * Architecture:
 * - SVG element with viewBox maintains aspect ratio
 * - Pointer events on the SVG handle all drag interactions
 * - RAF-throttled position updates prevent jank
 * - Player state is an array of 22 objects (11v11) with x/y in SVG coordinates
 * - FormationManager sidebar provides save/load/preset functionality
 * 
 * Drag system:
 * 1. pointerdown on a player → capture pointer, record offset
 * 2. pointermove → calculate new position via RAF, clamp to bounds
 * 3. pointerup → release capture, finalize position
 */
const TacticsBoard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(getDefaultPlayers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Refs for drag state (no re-renders during drag)
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    active: boolean;
    playerId: string | null;
    offsetX: number;
    offsetY: number;
    rafId: number | null;
    lastX: number;
    lastY: number;
  }>({
    active: false,
    playerId: null,
    offsetX: 0,
    offsetY: 0,
    rafId: null,
    lastX: 0,
    lastY: 0,
  });

  /**
   * Convert screen coordinates to SVG coordinate space.
   */
  const screenToSVG = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };

    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, []);

  /**
   * Clamp position to keep player within field boundaries.
   */
  const clampPosition = useCallback((x: number, y: number): { x: number; y: number } => {
    const r = PLAYER_RADIUS;
    const minX = FIELD.LEFT + r;
    const maxX = FIELD.RIGHT - r;
    const minY = FIELD.TOP + r;
    const maxY = FIELD.BOTTOM - r;

    let cx = Math.max(minX, Math.min(maxX, x));
    let cy = Math.max(minY, Math.min(maxY, y));

    // Snap to grid for cleaner positioning
    if (SNAP_GRID > 0) {
      cx = Math.round(cx / SNAP_GRID) * SNAP_GRID;
      cy = Math.round(cy / SNAP_GRID) * SNAP_GRID;
    }

    return { x: cx, y: cy };
  }, []);

  /**
   * Find which player was clicked based on SVG coordinates.
   */
  const findPlayerAtPoint = useCallback((svgX: number, svgY: number): Player | null => {
    for (let i = players.length - 1; i >= 0; i--) {
      const p = players[i];
      const dx = svgX - p.x;
      const dy = svgY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= PLAYER_RADIUS + 5) {
        return p;
      }
    }
    return null;
  }, [players]);

  /** POINTER DOWN — initiate drag or select player */
  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svgPt = screenToSVG(e.clientX, e.clientY);
    const player = findPlayerAtPoint(svgPt.x, svgPt.y);

    if (player) {
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);

      const offsetX = svgPt.x - player.x;
      const offsetY = svgPt.y - player.y;

      dragRef.current = {
        active: true,
        playerId: player.id,
        offsetX,
        offsetY,
        rafId: null,
        lastX: player.x,
        lastY: player.y,
      };

      setSelectedId(player.id);
      setDraggingId(player.id);
    } else {
      setSelectedId(null);
    }
  }, [screenToSVG, findPlayerAtPoint]);

  /** POINTER MOVE — update position via RAF */
  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag.active || !drag.playerId) return;

    e.preventDefault();

    const svgPt = screenToSVG(e.clientX, e.clientY);
    const rawX = svgPt.x - drag.offsetX;
    const rawY = svgPt.y - drag.offsetY;
    const clamped = clampPosition(rawX, rawY);

    drag.lastX = clamped.x;
    drag.lastY = clamped.y;

    // Schedule state update via RAF (at most once per frame)
    if (drag.rafId === null) {
      drag.rafId = requestAnimationFrame(() => {
        const d = dragRef.current;
        if (d.active && d.playerId) {
          setPlayers(prev =>
            prev.map(p =>
              p.id === d.playerId
                ? { ...p, x: d.lastX, y: d.lastY }
                : p
            )
          );
        }
        d.rafId = null;
      });
    }
  }, [screenToSVG, clampPosition]);

  /** POINTER UP — finalize drag */
  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;

    if (drag.active && drag.playerId) {
      if (drag.rafId !== null) {
        cancelAnimationFrame(drag.rafId);
      }

      setPlayers(prev =>
        prev.map(p =>
          p.id === drag.playerId
            ? { ...p, x: drag.lastX, y: drag.lastY }
            : p
        )
      );

      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture may already be released
      }
    }

    dragRef.current = {
      active: false,
      playerId: null,
      offsetX: 0,
      offsetY: 0,
      rafId: null,
      lastX: 0,
      lastY: 0,
    };

    setDraggingId(null);
  }, []);

  /** Reset to default formation */
  const handleReset = useCallback(() => {
    setPlayers(getDefaultPlayers());
    setSelectedId(null);
    setDraggingId(null);
  }, []);

  /** Load formation from manager */
  const handleLoadFormation = useCallback((newPlayers: Player[]) => {
    setPlayers(newPlayers);
    setSelectedId(null);
    setDraggingId(null);
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (dragRef.current.rafId !== null) {
        cancelAnimationFrame(dragRef.current.rafId);
      }
    };
  }, []);

  return (
    <div className="flex gap-0 w-full h-full">
      {/* ─── Sidebar: Formation Manager ─────────────────────── */}
      <div
        className={`shrink-0 border-r border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarOpen ? 'w-64 lg:w-72' : 'w-0'
        }`}
      >
        <div className="w-64 lg:w-72 h-full">
          <FormationManager
            players={players}
            onLoadFormation={handleLoadFormation}
          />
        </div>
      </div>

      {/* ─── Main Field Area ────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Controls bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            {/* Toggle sidebar button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title={sidebarOpen ? 'Hide panel' : 'Show panel'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {sidebarOpen ? (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </>
                ) : (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <polyline points="14 9 17 12 14 15" />
                  </>
                )}
              </svg>
            </button>

            <div className="h-5 w-px bg-gray-200" />

            {/* Team indicators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span className="text-xs text-gray-500 font-medium">Blue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="text-xs text-gray-500 font-medium">Red</span>
              </div>
            </div>

            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            {/* Player count */}
            <span className="text-xs text-gray-400 hidden sm:inline">
              {players.length} players
            </span>
          </div>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-colors shadow-sm"
          >
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Reset
            </span>
          </button>
        </div>

        {/* Field container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gray-50 overflow-auto">
          <div
            className="w-full max-w-xl rounded-xl overflow-hidden"
            style={{
              boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${FIELD.WIDTH} ${FIELD.HEIGHT}`}
              className="w-full h-auto block"
              style={{
                touchAction: 'none',
                userSelect: 'none',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <SoccerField />

              {/* Player tokens — dragged player rendered last (on top) */}
              {players
                .slice()
                .sort((a, b) => {
                  if (a.id === draggingId) return 1;
                  if (b.id === draggingId) return -1;
                  return 0;
                })
                .map(player => (
                  <PlayerToken
                    key={player.id}
                    player={player}
                    isSelected={selectedId === player.id}
                    isDragging={draggingId === player.id}
                  />
                ))}
            </svg>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <p className="text-[11px] text-gray-400 text-center">
            Drag players to reposition. Click to select. Use the panel to save, load, or apply preset formations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TacticsBoard;
