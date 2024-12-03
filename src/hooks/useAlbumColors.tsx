import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Vibrant from "node-vibrant";

type RGB = [number, number, number];
type ColorState = {
  current: RGB[];
  target: RGB[];
  transitioning: boolean;
};

// Move utility functions outside
const rgbToHex = ([r, g, b]: RGB): string =>
  "#" +
  [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");

const interpolateColor = (color1: RGB, color2: RGB, progress: number): RGB => [
  color1[0] + (color2[0] - color1[0]) * progress,
  color1[1] + (color2[1] - color1[1]) * progress,
  color1[2] + (color2[2] - color1[2]) * progress,
];

const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const DEFAULT_COLORS: RGB[] = [
  [26, 26, 26],
  [0, 0, 0],
  [51, 51, 51],
  [26, 26, 26],
  [0, 0, 0],
];

const SWATCH_TYPES = [
  "Vibrant",
  "Muted",
  "DarkVibrant",
  "DarkMuted",
  "LightVibrant",
] as const;

export function useAlbumColors(
  imageUrl: string | null,
  transitionDuration = 1000,
) {
  const [colorState, setColorState] = useState<ColorState>({
    current: DEFAULT_COLORS,
    target: DEFAULT_COLORS,
    transitioning: false,
  });
  // is car thing (or smaller than car thing)
  const [isMd, setIsMd] = useState(window.innerWidth > 820);

  const animationFrame = useRef<number>();
  const startTime = useRef<number>();
  const isMounted = useRef(true);

  // watch window innerWidth
  useEffect(() => {
    const handleResize = () => setIsMd(window.innerWidth > 820);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoized color extraction function
  const extractColors = useCallback(async (img: HTMLImageElement) => {
    try {
      const v = new Vibrant(img, { quality: 1, colorCount: 64 });
      const palette = await v.getPalette();

      const newColors = SWATCH_TYPES.map((type) => {
        const swatch = palette[type];
        return swatch ? (swatch.getRgb().map(Math.round) as RGB) : null;
      }).filter(Boolean) as RGB[];

      // Fill missing colors with random defaults
      while (newColors.length < 5) {
        newColors.push(
          DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
        );
      }

      return newColors;
    } catch (error) {
      console.error("Failed to extract colors:", error);
      return DEFAULT_COLORS;
    }
  }, []);

  // Image loading effect
  useEffect(() => {
    if (!imageUrl) {
      setColorState({
        current: DEFAULT_COLORS,
        target: DEFAULT_COLORS,
        transitioning: false,
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    const loadColors = async () => {
      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        if (!isMounted.current) return;

        const newColors = await extractColors(img);

        setColorState((prev) => ({
          ...prev,
          target: newColors,
          transitioning: true,
        }));
      } catch (error) {
        console.error("Failed to load image:", error);
        if (isMounted.current) {
          setColorState((prev) => ({
            ...prev,
            target: DEFAULT_COLORS,
            transitioning: true,
          }));
        }
      }
    };

    animationFrame.current = requestAnimationFrame(loadColors);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [imageUrl, extractColors]);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const linearProgress = Math.min(
        1,
        (timestamp - startTime.current) / transitionDuration,
      );

      const progress = easeInOut(linearProgress);

      setColorState((prev) => ({
        ...prev,
        current: prev.current.map((currentColor, i) =>
          interpolateColor(currentColor, prev.target[i], progress),
        ),
        transitioning: progress < 1,
      }));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        startTime.current = undefined;
      }
    },
    [transitionDuration],
  );

  // Animation effect
  useEffect(() => {
    if (!colorState.transitioning) return;

    // Skip animation for mobile devices
    if (isMd) {
      setColorState((prev) => ({
        ...prev,
        current: prev.target,
        transitioning: false,
      }));
      return;
    } else {
      animationFrame.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [colorState.transitioning, transitionDuration, animate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    colors: useMemo(() => colorState.current.map(rgbToHex), [colorState]),
    isTransitioning: colorState.transitioning,
  };
}
