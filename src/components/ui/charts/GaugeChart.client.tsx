'use client';
// src/components/ui/charts/GaugeChart.client.tsx

import * as React from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography, Stack } from '@mui/material';

type Props = {
  /** Value 0-100 */
  value: number;
  /** Label below gauge */
  label?: string;
  height?: number;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
};

/* ─────────────────────── Animated value (smooth float) ─────────────────────── */
function useAnimatedArc(target: number, duration = 1400) {
  const [smooth, setSmooth] = React.useState(0);
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    let raf: number;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      setSmooth(current);
      setDisplay(Math.round(current));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return { smooth, display };
}

/* ─────────────────────── Arc sweep + soft edge injection ─────────────────────── */
/**
 * Injects:
 * 1. A sweeping light along the value arc
 * 2. A soft feathered edge at the end of the value arc to smooth the
 *    transition between the colored arc and the grey track
 */
function useArcEffects(
  containerRef: React.RefObject<HTMLDivElement | null>,
  value: number,
  mainColor: string,
  isDark: boolean,
) {
  const uid = React.useId().replace(/:/g, '');

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || value <= 0) return;

    const svg = container.querySelector('svg');
    const valueArc = container.querySelector(
      `.${gaugeClasses.valueArc}`,
    ) as SVGPathElement | null;
    if (!svg || !valueArc) return;

    const d = valueArc.getAttribute('d');
    if (!d) return;

    const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tempPath.setAttribute('d', d);
    svg.appendChild(tempPath);
    const arcLen = tempPath.getTotalLength();
    svg.removeChild(tempPath);

    if (arcLen <= 0) return;

    const elements: SVGElement[] = [];

    // ─── 1. Sweep animation ───
    const streakLen = arcLen * 0.22;
    const gapLen = arcLen - streakLen;
    const peakOpacity = isDark ? 0.8 : 0.65;

    const animName = `arcSweep_${uid}`;
    const pathId = `arcSweepPath_${uid}`;
    const gradId = `arcSweepGrad_${uid}`;

    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = `
      @keyframes ${animName} {
        0%   { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: ${-arcLen}; }
      }
      #${pathId} {
        animation: ${animName} 2s linear infinite;
      }
    `;
    svg.insertBefore(styleEl, svg.firstChild);
    elements.push(styleEl);

    const bbox = valueArc.getBBox();
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="${gradId}" gradientUnits="userSpaceOnUse"
        x1="${bbox.x}" y1="${bbox.y}"
        x2="${bbox.x + bbox.width}" y2="${bbox.y}">
        <stop offset="0%" stop-color="white" stop-opacity="0"/>
        <stop offset="30%" stop-color="white" stop-opacity="${peakOpacity}"/>
        <stop offset="50%" stop-color="white" stop-opacity="${peakOpacity}"/>
        <stop offset="100%" stop-color="white" stop-opacity="0"/>
      </linearGradient>
    `;
    svg.insertBefore(defs, svg.firstChild);
    elements.push(defs);

    const sweepPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sweepPath.setAttribute('id', pathId);
    sweepPath.setAttribute('d', d);
    sweepPath.setAttribute('fill', 'none');
    sweepPath.setAttribute('stroke', `url(#${gradId})`);
    sweepPath.setAttribute('stroke-width', String(Math.max(8, arcLen * 0.04)));
    sweepPath.setAttribute('stroke-linecap', 'round');
    sweepPath.setAttribute('stroke-dasharray', `${streakLen} ${gapLen}`);
    sweepPath.setAttribute('pointer-events', 'none');
    valueArc.parentNode?.insertBefore(sweepPath, valueArc.nextSibling);
    elements.push(sweepPath);

    return () => {
      elements.forEach((el) => el.remove());
    };
  }, [containerRef, value, mainColor, isDark, uid]);
}

/* ─────────────────────── Speedometer ticks ─────────────────────── */
/**
 * Pure math approach — uses the known Gauge props to compute tick positions.
 * MUI Gauge center = (width/2, height/2) in its own SVG viewBox.
 * outerRadius = 85% of min(width, height) / 2.
 */
function SpeedometerTicks({
  width,
  height,
  value,
  mainColor,
  isDark,
}: {
  width: number;
  height: number;
  value: number;
  mainColor: string;
  isDark: boolean;
}) {
  const pad = height * 0.1;
  const svgW = width + pad * 2;
  const svgH = height + pad * 2;

  // MUI Gauge places its center at (width/2, height/2), shift down to align
  const cx = width / 2 + pad;
  const cy = height / 2 + pad + height * 0.17;

  // outerRadius="85%" means 85% of min(width, height) / 2
  const gaugeOuterR = (Math.min(width, height) / 2) * 0.85;

  // Place ticks just outside the outer arc
  const gap = gaugeOuterR * 0.05;
  const tickR = gaugeOuterR + gap + gaugeOuterR * 0.15;
  const majorLen = gaugeOuterR * 0.1;
  const minorLen = gaugeOuterR * 0.05;
  const labelR = tickR + majorLen + gaugeOuterR * 0.1;

  const startDeg = -111.5;
  const endDeg = 111.5;
  const totalSweep = endDeg - startDeg;
  const majorCount = 11;
  const minorPerMajor = 5;
  const totalTicks = (majorCount - 1) * minorPerMajor;

  const ticks: React.ReactNode[] = [];

  for (let i = 0; i <= totalTicks; i++) {
    const isMajor = i % minorPerMajor === 0;
    const fraction = i / totalTicks;
    const angleDeg = startDeg + fraction * totalSweep;
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;

    const len = isMajor ? majorLen : minorLen;
    const x1 = cx + (tickR - len) * Math.cos(angleRad);
    const y1 = cy + (tickR - len) * Math.sin(angleRad);
    const x2 = cx + tickR * Math.cos(angleRad);
    const y2 = cy + tickR * Math.sin(angleRad);

    const tickValue = fraction * 100;
    const isActive = tickValue <= value;

    ticks.push(
      <line
        key={`tick-${i}`}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={
          isMajor
            ? isActive ? mainColor : isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'
            : isActive ? alpha(mainColor, 0.4) : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'
        }
        strokeWidth={isMajor ? 2 : 1}
        strokeLinecap="round"
      />,
    );

    if (isMajor) {
      const labelVal = Math.round(fraction * 100);
      const lx = cx + labelR * Math.cos(angleRad);
      const ly = cy + labelR * Math.sin(angleRad);
      ticks.push(
        <text
          key={`label-${i}`}
          x={lx} y={ly}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={gaugeOuterR * 0.1}
          fontWeight={600}
          fill={
            isActive
              ? alpha(mainColor, 0.8)
              : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
          }
        >
          {labelVal}
        </text>,
      );
    }
  }

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{
        position: 'absolute',
        top: -pad,
        left: -pad,
        pointerEvents: 'none',
      }}
    >
      {ticks}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════ */
export default function GaugeChart({
  value,
  label,
  height = 200,
  color = 'success',
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  // Theme-aware main color: brighter in dark mode, deeper in light mode
  const mainColor =
    color === 'warning'
      ? isDark
        ? '#FFB74D' // vibrant amber for dark backgrounds
        : '#E67E22' // deep burnt orange for light backgrounds
      : theme.palette[color].main;
  const gaugeRef = React.useRef<HTMLDivElement>(null);

  // Client-only flag to avoid SSR hydration mismatch on tick coordinates
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Animate arc from 0 to target on every value change
  const { smooth: arcValue, display: animatedValue } = useAnimatedArc(value);

  // Inject sweep animation + soft edge into the Gauge's own SVG
  useArcEffects(gaugeRef, arcValue, mainColor, isDark);

  // Performance level (based on animated value for smooth transition)
  const level =
    animatedValue >= 75 ? 'Yüksek' : animatedValue >= 40 ? 'Orta' : 'Düşük';
  const levelColor =
    animatedValue >= 75
      ? isDark ? '#66BB6A' : '#2E7D32' // green: bright / deep
      : animatedValue >= 40
        ? isDark ? '#FFA726' : '#E67E22' // orange: bright / deep
        : isDark ? '#EF5350' : '#C62828'; // red: bright / deep

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',

        // Animations
        '@keyframes gaugeFadeIn': {
          from: { opacity: 0, transform: 'scale(0.85)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        '@keyframes pulseGlow': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.7 },
        },
        '@keyframes levelPulse': {
          '0%, 100%': { boxShadow: `0 0 0px ${alpha(levelColor, 0)}` },
          '50%': {
            boxShadow: `0 0 12px ${alpha(levelColor, isDark ? 0.35 : 0.2)}`,
          },
        },
        animation: 'gaugeFadeIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* ─── Background glow behind gauge ─── */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -45%)',
          width: height * 1.8,
          height: height * 1.4,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${alpha(mainColor, isDark ? 0.12 : 0.08)} 0%, ${alpha(mainColor, isDark ? 0.04 : 0.02)} 40%, transparent 70%)`,
          animation: 'pulseGlow 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* ─── Gauge container ─── */}
      <Box ref={gaugeRef} sx={{ position: 'relative' }}>
        <Gauge
          value={arcValue}
          startAngle={-110}
          endAngle={110}
          width={height * 1.2}
          height={height}
          outerRadius="85%"
          innerRadius="70%"
          sx={{
            // Value arc — color + glow
            [`& .${gaugeClasses.valueArc}`]: {
              fill: mainColor,
              filter: isDark
                ? `drop-shadow(0 0 10px ${alpha(mainColor, 0.6)}) drop-shadow(0 0 20px ${alpha(mainColor, 0.2)})`
                : `drop-shadow(0 0 8px ${alpha(mainColor, 0.3)}) drop-shadow(0 0 16px ${alpha(mainColor, 0.1)})`,
              transition: 'filter 0.3s ease',
            },
            // Reference arc (track) — distinct contrast per theme
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: isDark
                ? alpha(theme.palette.grey[600], 0.3)
                : alpha(theme.palette.grey[400], 0.3),
            },
            // Hide default text
            [`& .${gaugeClasses.valueText}`]: {
              display: 'none',
            },
          }}
          text={() => ''}
        />
        {mounted && (
          <SpeedometerTicks
            width={height * 1.2}
            height={height}
            value={arcValue}
            mainColor={mainColor}
            isDark={isDark}
          />
        )}
      </Box>

      {/* ─── Center overlay — value + badge ─── */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          mt: 7,
        }}
      >
        {/* Animated percentage */}
        <Typography
          sx={{
            fontSize: { xs: '2.8rem', sm: '3.5rem' },
            fontWeight: 900,
            lineHeight: 1,
            color: mainColor,
            textShadow: isDark
              ? `0 0 24px ${alpha(mainColor, 0.5)}, 0 0 48px ${alpha(mainColor, 0.15)}`
              : `0 1px 2px ${alpha('#000', 0.08)}`,
            letterSpacing: -1.5,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {animatedValue}
          <Typography
            component="span"
            sx={{
              fontSize: '1rem',
              fontWeight: 700,
              color: alpha(mainColor, 0.6),
              ml: 0.25,
              verticalAlign: 'super',
            }}
          >
            %
          </Typography>
        </Typography>

        {/* Level badge with pulse animation */}
        <Box
          sx={{
            mt: 2,
            px: 1.75,
            py: 0.35,
            borderRadius: 10,
            bgcolor: alpha(levelColor, isDark ? 0.15 : 0.1),
            border: `1px solid ${alpha(levelColor, isDark ? 0.3 : 0.2)}`,
            animation: 'levelPulse 2.5s ease-in-out infinite',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 800,
              color: levelColor,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {level}
          </Typography>
        </Box>
      </Box>

      {/* ─── Bottom section ─── */}
      {label && (
        <Typography
          variant="body2"
          sx={{
            mt: -1,
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: 0.3,
            fontSize: 12.5,
            textTransform: 'uppercase',
            opacity: 0.7,
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}
