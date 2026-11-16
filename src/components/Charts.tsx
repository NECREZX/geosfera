import React, { useState } from 'react';

export interface BarDatum {
  label: string;
  value: number;
  sublabel?: string;
  color?: string;
}

export const VerticalBarChart: React.FC<{
  data: BarDatum[];
  unit?: string;
  height?: number;
}> = ({ data, unit = 'kejadian', height = 210 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height }}>
        {data.map((item, idx) => {
          const pct = Math.max(4, Math.round((item.value / maxVal) * 100));
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group cursor-default"
            >
              <div className="mb-1.5 text-[11px] font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                {item.value}
              </div>
              <div className="w-full flex-1 flex items-end justify-center max-w-[44px]">
                <div
                  className="w-full rounded-t transition-opacity duration-150"
                  style={{
                    height: `${item.value === 0 ? 2 : pct}%`,
                    backgroundColor: item.color || '#0369A1',
                    opacity: hoveredIdx === null || isHovered ? 0.92 : 0.45,
                  }}
                  title={`${item.label}: ${item.value} ${unit}`}
                />
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate max-w-full text-center">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export interface DailySeriesDatum {
  dateLabel: string;
  count: number;
  maxMag: number;
}

export const DailyTrendChart: React.FC<{ data: DailySeriesDatum[] }> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="h-[210px] flex items-center justify-center text-sm text-slate-500">
        Belum ada rangkaian data harian.
      </div>
    );
  }

  const width = 640;
  const height = 210;
  const padLeft = 34;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 28;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxCount = Math.max(4, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? chartW / (data.length - 1) : chartW / 2;

  const points = data.map((d, i) => {
    const x = data.length > 1 ? padLeft + i * stepX : padLeft + chartW / 2;
    const y = padTop + chartH - (d.count / maxCount) * chartH;
    return { x, y, ...d };
  });

  const polylinePath = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `M ${points[0].x},${padTop + chartH} L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} L ${
          points[points.length - 1].x
        },${padTop + chartH} Z`
      : '';

  const yTicks = [0, Math.round(maxCount / 2), maxCount];

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[210px] overflow-visible">
        {yTicks.map((tick) => {
          const y = padTop + chartH - (tick / maxCount) * chartH;
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth={1}
              />
              <text
                x={padLeft - 6}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {areaPath && <path d={areaPath} fill="#0369A1" fillOpacity={0.12} />}
        {polylinePath && (
          <polyline
            fill="none"
            stroke="#0369A1"
            strokeWidth={2}
            strokeLinejoin="round"
            points={polylinePath}
          />
        )}

        {points.map((p, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g
              key={p.dateLabel}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {isHovered && (
                <line
                  x1={p.x}
                  y1={padTop}
                  x2={p.x}
                  y2={padTop + chartH}
                  className="stroke-slate-300 dark:stroke-slate-700"
                  strokeDasharray="3 3"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5.5 : 3.5}
                fill={isHovered ? '#0284C7' : '#0369A1'}
                className="stroke-white dark:stroke-slate-900"
                strokeWidth={1.5}
              />
              <text
                x={p.x}
                y={height - 6}
                textAnchor="middle"
                className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
              >
                {p.dateLabel}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredIdx !== null && points[hoveredIdx] && (
        <div className="mt-2 flex items-center justify-between text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-2">
          <span>Tanggal: {points[hoveredIdx].dateLabel}</span>
          <span>
            Frekuensi: <strong>{points[hoveredIdx].count}</strong> kejadian · Mag. Maks:{' '}
            <strong>M {points[hoveredIdx].maxMag.toFixed(1)}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export const HorizontalBarChart: React.FC<{
  data: BarDatum[];
  unit?: string;
}> = ({ data, unit = 'kejadian' }) => {
  const maxVal = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="space-y-2.5">
      {data.map((item) => {
        const pct = Math.round((item.value / maxVal) * 100);
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                {item.label}
              </span>
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                {item.value} {unit}
                {item.sublabel ? ` · ${item.sublabel}` : ''}
              </span>
            </div>
            <div className="h-2 w-full rounded-sm bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-sm transition-all duration-200"
                style={{
                  width: `${item.value === 0 ? 0 : Math.max(3, pct)}%`,
                  backgroundColor: item.color || '#0369A1',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
