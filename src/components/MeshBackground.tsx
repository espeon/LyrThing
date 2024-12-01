import React from "react";

type RadialGradientProps = {
  colors: string[]; // Array of colors in hex format (e.g., ["#1a1a1a", "#333333"])
  transitionDuration?: number; // Optional: Duration for the gradient transition in ms
};

const MeshBackground: React.FC<RadialGradientProps> = ({ colors }) => {
  const [vibrant, muted, darkVibrant, darkMuted, lightVibrant] = colors;
  // Join the colors array into a CSS-friendly gradient string
  const gradient = `
    radial-gradient(circle at 25% 25%, ${vibrant} 0px, transparent 50%),
    radial-gradient(
      circle at 85% 15%,
      ${vibrant} 0px,
      transparent 45%
    ),
    radial-gradient(
      ellipse at 0% 55%,
      ${vibrant} 0px,
      transparent 20%
    ),
    radial-gradient(
      circle at ${60}% ${40}%,
      ${darkVibrant},
      transparent 55%
    ),
    radial-gradient(
      ellipse at 65% 95%,
      ${darkMuted} 10px,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 80%,
      ${muted} 0px,
      transparent 65%
    ),
    radial-gradient(
      circle at 30% 60%,
      ${lightVibrant} 0px,
      transparent 65%
    )
  `;

  return (
    <div
      style={{
        background: gradient,
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default MeshBackground;
