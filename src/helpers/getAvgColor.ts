export function getAverageRGB(
  base64Image: string,
): Promise<[number, number, number]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Failed to get 2D context from canvas.");

        // Resize canvas to improve performance
        const maxDim = 20; // Maximum dimension of 20x20
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const canvasWidth = Math.floor(img.width * scale);
        const canvasHeight = Math.floor(img.height * scale);

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        context.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        const imageData = context.getImageData(
          0,
          0,
          canvasWidth,
          canvasHeight,
        ).data;

        // Calculate average RGB
        let r = 0,
          g = 0,
          b = 0;
        const length = imageData.length / 4; // RGBA channels
        for (let i = 0; i < imageData.length; i += 4) {
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
        }

        resolve([
          Math.round(r / length),
          Math.round(g / length),
          Math.round(b / length),
        ]);
      } catch (error: unknown) {
        reject(
          new Error(`Failed to process image: ${(error as Error).message}`),
        );
      }
    };

    img.onerror = () => reject(new Error("Failed to load image."));
    img.src = base64Image;
  });
}

/**
 * Converts a hex color string to RGB values
 * @param hex - Hex color string (e.g., '#FF0000' or 'FF0000')
 * @returns An object with red, green, and blue values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, "");

  // Handle 3-digit and 6-digit hex codes
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Parse the hex values
  const bigint = parseInt(hex, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Calculates the average RGB color from an array of hex color values
 * @param colors - Array of hex color strings
 * @returns An object with average red, green, and blue values
 */
export function getAverageColor(colors: string[]): {
  r: number;
  g: number;
  b: number;
} {
  // Validate input
  if (!colors || colors.length === 0) {
    throw new Error("Color array is empty");
  }

  // Convert hex colors to RGB
  const rgbColors = colors.map(hexToRgb);

  // Calculate the sum of each color channel
  const sum = rgbColors.reduce(
    (acc, color) => ({
      r: acc.r + color.r,
      g: acc.g + color.g,
      b: acc.b + color.b,
    }),
    { r: 0, g: 0, b: 0 },
  );

  // Calculate the average
  return {
    r: Math.round(sum.r / colors.length),
    g: Math.round(sum.g / colors.length),
    b: Math.round(sum.b / colors.length),
  };
}

export function chooseTextColor([r, g, b]: [number, number, number]): string {
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 128 ? "rgba(10, 10, 10)" : "rgba(245, 245, 245)";
}

export function colorArrToCSS(
  color: [number, number, number],
  transparency?: number,
): string {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${transparency ?? 1})`;
}

// Utility to clamp RGB values
const clamp = (value: number): number => Math.max(0, Math.min(255, value));

// Calculate complementary color
export function getComplementaryColor([r, g, b]: [number, number, number]): [
  number,
  number,
  number,
] {
  return [255 - r, 255 - g, 255 - b];
}

// Calculate matching opposite color with adjustments
export function getMatchingOppositeColor(
  [r, g, b]: [number, number, number],
  adjustment = 30,
): [number, number, number] {
  return getComplementaryColor([r, g, b]).map((color, i) =>
    clamp(color + ([r, g, b][i] < 128 ? adjustment : -adjustment)),
  ) as [number, number, number];
}
