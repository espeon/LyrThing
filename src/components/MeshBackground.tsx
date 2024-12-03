import React, { useMemo } from "react";

type RadialGradientProps = {
  colors: string[];
  transitionDuration?: number;
};

// Static styles outside component
const baseStyles: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

// Utility function to create gradient
const createGradientString = (colors: string[]) => {
  const [vibrant, muted, darkVibrant, darkMuted, lightVibrant] = colors;

  const gradients = [
    `radial-gradient(circle at 25% 25%, ${vibrant} 0px, transparent 50%)`,
    `radial-gradient(circle at 85% 15%, ${vibrant} 0px, transparent 45%)`,
    `radial-gradient(ellipse at 0% 55%, ${vibrant} 0px, transparent 20%)`,
    `radial-gradient(circle at 60% 40%, ${darkVibrant}, transparent 55%)`,
    `radial-gradient(ellipse at 65% 95%, ${darkMuted} 10px, transparent 50%)`,
    `radial-gradient(circle at 80% 80%, ${muted} 0px, transparent 65%)`,
    `radial-gradient(circle at 30% 60%, ${lightVibrant} 0px, transparent 65%)`,
  ].join(",");

  return gradients;
};

const MeshBackground: React.FC<RadialGradientProps> = React.memo(
  ({ colors }) => {
    // Memoize gradient calculation
    const gradient = useMemo(() => createGradientString(colors), [colors]);

    return (
      <div
        style={{
          ...baseStyles,
          background: gradient,
        }}
      />
    );
  },
);

// Display name for debugging
MeshBackground.displayName = "MeshBackground";

export default MeshBackground;
