import { useState, useEffect, useRef } from "react";
import Vibrant from "node-vibrant";

type RGB = [number, number, number];
type ColorState = {
  current: RGB[];
  target: RGB[];
  transitioning: boolean;
};

function rgbToHex([r, g, b]: RGB): string {
  return (
    "#" +
    [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")
  );
}

function interpolateColor(color1: RGB, color2: RGB, progress: number): RGB {
  return [
    color1[0] + (color2[0] - color1[0]) * progress,
    color1[1] + (color2[1] - color1[1]) * progress,
    color1[2] + (color2[2] - color1[2]) * progress,
  ];
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const defaultColors: RGB[] = [
  [26, 26, 26], // #1a1a1a
  [0, 0, 0], // #000000
  [51, 51, 51], // #333333
  [26, 26, 26], // #1a1a1a
  [0, 0, 0], // #000000
];

export function useAlbumColors(
  imageUrl: string | null,
  transitionDuration = 1000,
) {
  const [colorState, setColorState] = useState<ColorState>({
    current: defaultColors,
    target: defaultColors,
    transitioning: false,
  });

  const animationFrame = useRef<number>();
  const startTime = useRef<number>();

  useEffect(() => {
    console.log("imageUrl", imageUrl);
    if (!imageUrl)
      return setColorState({
        current: defaultColors,
        target: defaultColors,
        transitioning: false,
      });

    const img = new Image();
    img.crossOrigin = "Anonymous";
    // pass in b64 image (what the heck)
    img.src = imageUrl;

    const loadColors = async () => {
      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const v = new Vibrant(img, { quality: 1, colorCount: 64 });
        const palette = await v.getPalette();

        const swatchTypes = [
          "Vibrant",
          "Muted",
          "DarkVibrant",
          "DarkMuted",
          "LightVibrant",
        ];

        const newColors = swatchTypes
          .map((type) => {
            const swatch = palette[type];
            return swatch ? (swatch.getRgb().map(Math.round) as RGB) : null;
          })
          .filter(Boolean) as RGB[];

        while (newColors.length < 5) {
          newColors.push(
            defaultColors[Math.floor(Math.random() * defaultColors.length)],
          );
        }

        setColorState((prev) => ({
          ...prev,
          target: newColors,
          transitioning: true,
        }));
      } catch (error) {
        console.error("Failed to extract colors:", error);
        setColorState((prev) => ({
          ...prev,
          target: defaultColors,
          transitioning: true,
        }));
      }
    };

    // schedule this
    animationFrame.current = requestAnimationFrame(loadColors);

    // Cleanup
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [imageUrl]);

  // Handle the animation
  useEffect(() => {
    if (!colorState.transitioning) return;

    // if browser width is less than 1024px, transition instantly for perf
    if (window.innerWidth < 1024) {
      setColorState((prev) => ({
        ...prev,
        transitioning: false,
      }));
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const linearProgress = Math.min(
        1,
        (timestamp - startTime.current) / transitionDuration,
      );

      const progress = easeInOut(linearProgress);

      const interpolatedColors = colorState.current.map((currentColor, i) =>
        interpolateColor(currentColor, colorState.target[i], progress),
      );

      setColorState((prev) => ({
        ...prev,
        current: interpolatedColors,
        transitioning: progress < 1,
      }));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        startTime.current = undefined;
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [colorState, transitionDuration]);

  // Convert current colors to hex for consuming components
  const colors = colorState.current.map(rgbToHex);

  return {
    colors,
    isTransitioning: colorState.transitioning,
  };
}

// Example usage:
/*
function AlbumArtwork({ imageUrl }) {
  const { colors, isTransitioning } = useAlbumColors(imageUrl, 1000); // 1 second transition

  return (
    <div
      style={{
        background: `linear-gradient(to bottom, ${colors.join(', ')})`,
        transition: isTransitioning ? 'none' : 'background 0.3s ease'
      }}
    >
      <img src={imageUrl} alt="Album artwork" />
    </div>
  );
}
*/
