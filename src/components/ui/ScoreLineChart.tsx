import React, { useId, useMemo } from 'react';

export interface ScoreChartPoint {
  label: string;
  value: number;
}

interface ScoreLineChartProps {
  points: ScoreChartPoint[];
  height?: number;
  maxValue?: number;
  className?: string;
}

const W = 680;

export const ScoreLineChart: React.FC<ScoreLineChartProps> = ({
  points,
  height = 260,
  maxValue = 1000,
  className,
}) => {
  const gradientId = useId();
  const PL = 48;
  const PR = 20;
  const PT = 24;
  const PB = 38;
  const innerW = W - PL - PR;
  const innerH = height - PT - PB;

  const { ticks, coords, xAt, yAt, showLabelEvery } = useMemo(() => {
    const n = points.length;
    const values = points.map((p) => p.value);
    const dataMin = n ? Math.min(...values) : 0;
    const dataMax = n ? Math.max(...values) : 0;

    let loV = Math.max(0, Math.floor((dataMin - 40) / 50) * 50);
    let hiV = Math.min(maxValue, Math.ceil((dataMax + 40) / 50) * 50);
    if (hiV - loV < 100) hiV = Math.min(maxValue, loV + 100);
    if (hiV - loV < 1) hiV = loV + 100;

    const xAt = (i: number) => (n === 1 ? PL + innerW / 2 : PL + (i / (n - 1)) * innerW);
    const yAt = (v: number) => PT + innerH - ((v - loV) / (hiV - loV)) * innerH;

    const tickCount = 4;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
      Math.round(loV + ((hiV - loV) * i) / tickCount)
    );

    const coords = points.map((p, i) => `${xAt(i)},${yAt(p.value)}`).join(' ');
    const showLabelEvery = Math.max(1, Math.ceil(n / 7));

    return { ticks, coords, xAt, yAt, showLabelEvery };
  }, [points, innerH, maxValue]);

  if (points.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      width="100%"
      height={height}
      className={className}
      role="img"
      aria-label="Grafik perkembangan nilai UTBK"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {ticks.map((t, i) => (
        <g key={`grid-${i}`}>
          <line
            x1={PL}
            x2={W - PR}
            y1={yAt(t)}
            y2={yAt(t)}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 5"
          />
          <text
            x={PL - 10}
            y={yAt(t) + 3.5}
            textAnchor="end"
            fontSize="11"
            fill="var(--muted-foreground)"
          >
            {t}
          </text>
        </g>
      ))}

      {points.length > 1 && (
        <polygon
          points={`${xAt(0)},${PT + innerH} ${coords} ${xAt(points.length - 1)},${PT + innerH}`}
          fill={`url(#${gradientId})`}
        />
      )}

      {points.length > 1 && (
        <polyline
          points={coords}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {points.map((p, i) => (
        <g key={`pt-${i}`}>
          <circle
            cx={xAt(i)}
            cy={yAt(p.value)}
            r="4.5"
            fill="var(--card)"
            stroke="var(--primary)"
            strokeWidth="2.5"
          />
          <text
            x={xAt(i)}
            y={yAt(p.value) - 12}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="var(--primary)"
          >
            {p.value}
          </text>
          {i % showLabelEvery === 0 && (
            <text
              x={xAt(i)}
              y={PT + innerH + 22}
              textAnchor="middle"
              fontSize="10"
              fill="var(--muted-foreground)"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};
