import React from 'react';
import { FIELD } from '@/types/tactics';

/**
 * SoccerField — renders a regulation soccer pitch using SVG.
 * 
 * All dimensions follow the 75×120 yard ratio (scaled 10x → 750×1200 SVG units).
 * The field is drawn within a padded area (FIELD.PADDING from each edge).
 * 
 * Markings included:
 * - Outer boundary
 * - Halfway line + center circle + center spot
 * - Penalty areas (18-yard boxes)
 * - Goal areas (6-yard boxes)
 * - Penalty spots
 * - Corner arcs
 * - Goals (behind the line)
 */
const SoccerField: React.FC = React.memo(() => {
  const w = FIELD.PLAY_WIDTH;   // 670
  const h = FIELD.PLAY_HEIGHT;  // 1120
  const left = FIELD.LEFT;      // 40
  const top = FIELD.TOP;        // 40
  const right = FIELD.RIGHT;    // 710
  const bottom = FIELD.BOTTOM;  // 1160
  const cx = FIELD.WIDTH / 2;   // 375
  const cy = FIELD.HEIGHT / 2;  // 600

  // Penalty area dimensions (18 yards = 180 SVG units)
  const penW = 440;  // ~44 yards wide (centered)
  const penH = 180;  // 18 yards deep
  const penLeft = cx - penW / 2;


  // Goal area dimensions (6 yards = 60 SVG units)
  const goalAreaW = 200; // ~20 yards wide (centered)
  const goalAreaH = 60;  // 6 yards deep
  const goalAreaLeft = cx - goalAreaW / 2;

  // Center circle radius (10 yards = 100 SVG units)
  const centerR = 100;

  // Penalty spot distance (12 yards = 120 SVG units from goal line)
  const penSpotDist = 120;

  // Corner arc radius (1 yard = 10 SVG units)
  const cornerR = 15;

  // Goal dimensions
  const goalW = 80;  // ~8 yards wide
  const goalH = 20;  // depth behind line
  const goalLeft = cx - goalW / 2;

  const lineColor = 'rgba(255,255,255,0.9)';
  const lineWidth = 2.5;

  return (
    <g>
      {/* Grass background with subtle gradient */}
      <defs>
        <linearGradient id="grassGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2D8C3C" />
          <stop offset="50%" stopColor="#34A145" />
          <stop offset="100%" stopColor="#2D8C3C" />
        </linearGradient>
        {/* Alternating grass stripes pattern */}
        <pattern id="grassStripes" width={w} height={h / 10} patternUnits="userSpaceOnUse" x={left} y={top}>
          <rect width={w} height={h / 20} fill="rgba(255,255,255,0.02)" />
          <rect y={h / 20} width={w} height={h / 20} fill="rgba(0,0,0,0.02)" />
        </pattern>
      </defs>

      {/* Field base */}
      <rect
        x={0}
        y={0}
        width={FIELD.WIDTH}
        height={FIELD.HEIGHT}
        fill="url(#grassGradient)"
        rx={8}
      />

      {/* Grass stripe overlay */}
      <rect
        x={left}
        y={top}
        width={w}
        height={h}
        fill="url(#grassStripes)"
      />

      {/* === FIELD MARKINGS === */}
      {/* Outer boundary */}
      <rect
        x={left}
        y={top}
        width={w}
        height={h}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Halfway line */}
      <line
        x1={left}
        y1={cy}
        x2={right}
        y2={cy}
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Center circle */}
      <circle
        cx={cx}
        cy={cy}
        r={centerR}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Center spot */}
      <circle cx={cx} cy={cy} r={4} fill={lineColor} />

      {/* === TOP PENALTY AREA === */}
      <rect
        x={penLeft}
        y={top}
        width={penW}
        height={penH}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Top goal area */}
      <rect
        x={goalAreaLeft}
        y={top}
        width={goalAreaW}
        height={goalAreaH}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Top penalty spot */}
      <circle cx={cx} cy={top + penSpotDist} r={4} fill={lineColor} />

      {/* Top penalty arc (the arc outside the penalty box) */}
      <path
        d={describeArc(cx, top + penSpotDist, centerR, 
          getArcAngles(penSpotDist, penH, centerR).startAngle,
          getArcAngles(penSpotDist, penH, centerR).endAngle
        )}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* === BOTTOM PENALTY AREA === */}
      <rect
        x={penLeft}
        y={bottom - penH}
        width={penW}
        height={penH}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Bottom goal area */}
      <rect
        x={goalAreaLeft}
        y={bottom - goalAreaH}
        width={goalAreaW}
        height={goalAreaH}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Bottom penalty spot */}
      <circle cx={cx} cy={bottom - penSpotDist} r={4} fill={lineColor} />

      {/* Bottom penalty arc */}
      <path
        d={describeArc(cx, bottom - penSpotDist, centerR,
          getArcAngles(penSpotDist, penH, centerR, true).startAngle,
          getArcAngles(penSpotDist, penH, centerR, true).endAngle
        )}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* === CORNER ARCS === */}
      {/* Top-left */}
      <path
        d={`M ${left} ${top + cornerR} A ${cornerR} ${cornerR} 0 0 1 ${left + cornerR} ${top}`}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
      {/* Top-right */}
      <path
        d={`M ${right - cornerR} ${top} A ${cornerR} ${cornerR} 0 0 1 ${right} ${top + cornerR}`}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
      {/* Bottom-left */}
      <path
        d={`M ${left + cornerR} ${bottom} A ${cornerR} ${cornerR} 0 0 1 ${left} ${bottom - cornerR}`}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
      {/* Bottom-right */}
      <path
        d={`M ${right} ${bottom - cornerR} A ${cornerR} ${cornerR} 0 0 1 ${right - cornerR} ${bottom}`}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* === GOALS === */}
      {/* Top goal */}
      <rect
        x={goalLeft}
        y={top - goalH}
        width={goalW}
        height={goalH}
        fill="rgba(255,255,255,0.08)"
        stroke={lineColor}
        strokeWidth={2}
      />
      {/* Goal net pattern - top */}
      <line x1={goalLeft} y1={top - goalH / 2} x2={goalLeft + goalW} y2={top - goalH / 2} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />

      {/* Bottom goal */}
      <rect
        x={goalLeft}
        y={bottom}
        width={goalW}
        height={goalH}
        fill="rgba(255,255,255,0.08)"
        stroke={lineColor}
        strokeWidth={2}
      />
      {/* Goal net pattern - bottom */}
      <line x1={goalLeft} y1={bottom + goalH / 2} x2={goalLeft + goalW} y2={bottom + goalH / 2} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
    </g>
  );
});

SoccerField.displayName = 'SoccerField';

/**
 * Helper: Calculate the angles for the penalty arc
 * (the portion of the circle that extends beyond the penalty box)
 */
function getArcAngles(
  spotDist: number,
  boxDepth: number,
  radius: number,
  isBottom: boolean = false
): { startAngle: number; endAngle: number } {
  // Distance from spot to box edge
  const dy = boxDepth - spotDist;
  // Angle where arc intersects the penalty box line
  const angle = Math.acos(Math.abs(dy) / radius) * (180 / Math.PI);

  if (isBottom) {
    // Bottom: arc curves upward (into the field)
    return { startAngle: 180 + angle, endAngle: 360 - angle };
  }
  // Top: arc curves downward (into the field)
  return { startAngle: angle, endAngle: 180 - angle };
}

/**
 * Helper: Generate SVG arc path from center, radius, and angles
 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export default SoccerField;
