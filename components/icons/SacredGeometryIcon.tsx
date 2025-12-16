import React from 'react';

const SacredGeometryIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => {
  const radius = 25;
  const cx = 50;
  const cy = 50;
  const angleStep = Math.PI / 3;

  const circles = [];
  // Central circle
  circles.push({ cx: cx, cy: cy });

  // 6 surrounding circles
  for (let i = 0; i < 6; i++) {
    const angle = angleStep * i;
    circles.push({
      cx: cx + radius * Math.cos(angle),
      cy: cy + radius * Math.sin(angle),
    });
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <g stroke="currentColor" strokeWidth="1.5">
        {circles.map((circle, index) => (
          <circle key={index} cx={circle.cx} cy={circle.cy} r={radius} />
        ))}
      </g>
    </svg>
  );
};

export default SacredGeometryIcon;
