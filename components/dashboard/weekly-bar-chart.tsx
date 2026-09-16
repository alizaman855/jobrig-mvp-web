type BarDatum = {
  label: string;
  value: number;
  tooltip: string;
};

const CHART_HEIGHT = 140;
const BAR_MAX_WIDTH = 24;
const GAP = 8;

export function WeeklyBarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = data.length * (BAR_MAX_WIDTH + GAP) + GAP;

  // Three gridlines at 0%, 50%, 100% of the max — recessive, hairline, solid.
  const gridSteps = [0, 0.5, 1];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT + 24}`}
        className="h-[164px] w-full min-w-[280px]"
        role="img"
        aria-label="Weekly chart"
      >
        {gridSteps.map((step) => {
          const y = CHART_HEIGHT - step * CHART_HEIGHT;
          return (
            <line
              key={step}
              x1={0}
              x2={width}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeWidth={1}
            />
          );
        })}
        {data.map((d, i) => {
          const barHeight = max === 0 ? 0 : (d.value / max) * (CHART_HEIGHT - 4);
          const x = GAP + i * (BAR_MAX_WIDTH + GAP);
          const y = CHART_HEIGHT - barHeight;
          return (
            <g key={d.label}>
              <title>{d.tooltip}</title>
              <rect
                x={x}
                y={y}
                width={BAR_MAX_WIDTH}
                height={Math.max(barHeight, 1)}
                rx={4}
                fill="var(--primary)"
              />
              <text
                x={x + BAR_MAX_WIDTH / 2}
                y={CHART_HEIGHT + 16}
                textAnchor="middle"
                fontSize={10}
                fill="var(--muted-foreground)"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
