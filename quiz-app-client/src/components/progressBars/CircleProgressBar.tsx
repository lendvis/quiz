import React from "react";

interface ProgressSegment {
  value: number;
  color: string;
}

interface CircleProgressBarProps {
  size?: number;
  strokeWidth?: number;
  segments: ProgressSegment[];
  circleColor?: string;
}

export const CircleProgressBar: React.FC<CircleProgressBarProps> = ({
  size = 175,
  strokeWidth = 10,
  segments,
  circleColor = "text-gray-200",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="relative flex items-center justify-center w-max">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          stroke="currentColor"
          className={circleColor}
          strokeWidth={strokeWidth}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />

        {segments.map((segment, index) => {
          const segmentLength = (segment.value / 100) * circumference;
          
          const strokeDashoffset = -currentOffset;    

          currentOffset += segmentLength;

          return (
            <circle
              key={index}
              stroke="currentColor"
              className={`${segment.color} transition-all duration-500 ease-in-out`}
              strokeWidth={strokeWidth}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeDasharray={`${segmentLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}

              strokeLinecap="butt" 
            />
          );
        })}
      </svg>
    </div>
  );
};