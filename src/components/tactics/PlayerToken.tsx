import React from 'react';
import { Player, PLAYER_RADIUS, TEAM_COLORS } from '@/types/tactics';

interface PlayerTokenProps {
  player: Player;
  isSelected: boolean;
  isDragging: boolean;
}

/**
 * PlayerToken — renders a single player as an SVG circle with jersey number.
 * 
 * Visual states:
 * - Default: team-colored circle with white number
 * - Selected: cyan glow outline ring with pulse animation
 * - Dragging: elevated shadow effect
 * 
 * Pointer events are handled by the parent TacticsBoard SVG for performance.
 */
const PlayerToken: React.FC<PlayerTokenProps> = React.memo(({ player, isSelected, isDragging }) => {
  const colors = TEAM_COLORS[player.team];
  const r = PLAYER_RADIUS;

  return (
    <g
      data-player-id={player.id}
      transform={`translate(${player.x}, ${player.y})`}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'transform 0.08s ease-out',
      }}
    >
      {/* Drop shadow when dragging */}
      {isDragging && (
        <circle
          cx={2}
          cy={3}
          r={r + 2}
          fill="rgba(0,0,0,0.25)"
        />
      )}

      {/* Selection glow ring */}
      {isSelected && (
        <circle
          cx={0}
          cy={0}
          r={r + 5}
          fill="none"
          stroke="#06B6D4"
          strokeWidth={2.5}
          opacity={0.8}
        >
          <animate
            attributeName="r"
            values={`${r + 4};${r + 7};${r + 4}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0.35;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Main circle */}
      <circle
        cx={0}
        cy={0}
        r={r}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={2}
      />

      {/* Inner highlight (subtle 3D effect) */}
      <circle
        cx={-3}
        cy={-4}
        r={r * 0.5}
        fill="rgba(255,255,255,0.15)"
      />

      {/* Jersey number */}
      <text
        x={0}
        y={1}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.text}
        fontSize={r * 0.9}
        fontWeight={700}
        fontFamily="system-ui, -apple-system, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {player.number}
      </text>
    </g>
  );
});

PlayerToken.displayName = 'PlayerToken';

export default PlayerToken;
