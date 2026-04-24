interface DeviceFlowGraphicProps {
  className?: string;
}

export function DeviceFlowGraphic({ className = "" }: DeviceFlowGraphicProps) {
  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 60 900 100"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full overflow-visible"
      >
        <defs>
          <linearGradient
            id="deviceFlowPacketGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--ring)" stopOpacity="0" />
          </linearGradient>

          <linearGradient
            id="deviceFlowLineGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="50%" stopColor="var(--ring)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.35" />
          </linearGradient>

          <marker
            id="deviceFlowArrowhead"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 12 6 L 0 12 Z" fill="var(--ring)" />
          </marker>
        </defs>

        <path
          d="M 0 100 Q 250 50, 450 100 T 895 100"
          stroke="url(#deviceFlowLineGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
          markerEnd="url(#deviceFlowArrowhead)"
        />

        <circle r="6" fill="url(#deviceFlowPacketGradient)">
          <animateMotion
            dur="4s"
            repeatCount="indefinite"
            path="M 0 100 Q 250 50, 450 100 T 895 100"
          />
        </circle>

        <circle cx="150" cy="80" r="8" fill="var(--primary)" opacity="0.85">
          <animate
            attributeName="r"
            values="8;10;8"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="400" cy="89" r="8" fill="var(--ring)" opacity="0.85">
          <animate
            attributeName="r"
            values="8;10;8"
            dur="2s"
            repeatCount="indefinite"
            begin="0.7s"
          />
        </circle>

        <circle cx="650" cy="125" r="8" fill="var(--primary)" opacity="0.75">
          <animate
            attributeName="r"
            values="8;10;8"
            dur="2s"
            repeatCount="indefinite"
            begin="1.4s"
          />
        </circle>

        <text
          x="150"
          y="110"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize="14"
          fontFamily="var(--font-sans, system-ui, sans-serif)"
          fontWeight="600"
        >
          Thingsboard
        </text>
        <text
          x="400"
          y="115"
          textAnchor="middle"
          fill="var(--primary)"
          fontSize="14"
          fontFamily="var(--font-sans, system-ui, sans-serif)"
          fontWeight="600"
        >
          Medplum
        </text>
        <text
          x="650"
          y="150"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize="14"
          fontFamily="var(--font-sans, system-ui, sans-serif)"
          fontWeight="600"
        >
          Engine
        </text>
      </svg>
    </div>
  );
}
