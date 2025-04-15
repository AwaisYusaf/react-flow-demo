import React from "react";

interface DropIndicatorProps {
  x: number;
  y: number;
  height: number;
}

export default function DropIndicator({ x, y, height }: DropIndicatorProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: "4px",
        height: `${height}px`,
        backgroundColor: "#3b82f6",
        borderRadius: "2px",
        transition: "transform 0.1s ease",
        transform: "scaleY(1.1)",
        boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    />
  );
}
