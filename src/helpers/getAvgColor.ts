export function getAverageRGB(base64Image: string): Promise<[number, number, number] | Error> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Handle CORS if necessary
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (!context) {
                    console.error('Failed to get 2D context from canvas.');
                    return null;
                }
                
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0, img.width, img.height);
                
                const imageData = context.getImageData(0, 0, img.width, img.height).data;
                
                // Calculate average color
                let r = 0, g = 0, b = 0;
                const length = imageData.length / 4; // RGBA
                for (let i = 0; i < imageData.length; i += 4) {
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                }
                r = Math.round(r / length);
                g = Math.round(g / length);
                b = Math.round(b / length);
                
                resolve([r, g, b]);
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = (error) => reject(`Image loading error: ${error}`);
        
        img.src = base64Image;
    });
}

function getLuminance([r, g, b]: [number, number, number]): number {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  
export function chooseTextColor(averageRGB: [number, number, number]): 'black' | 'white' {
    const luminance = getLuminance(averageRGB);
    return luminance > 128 ? "rgba(10, 10, 10)" : "rgba(245, 245, 245)";
  }

/// Get the complementary color for the input color
export function getComplementaryColor([r, g, b]: [number, number, number]): [number, number, number] {
    return [255-r, 255-g, 255-b];
}

export function colorArrToCSS([r, g, b]: [number, number, number], transparency?: number): string {
    return `rgba(${r}, ${g}, ${b}, ${transparency ?? "var(--tw-bg-opacity)"})`;
}

export function getMatchingOppositeColor([r, g, b]: [number, number, number]): [number, number, number] {
    // Invert the RGB values to get the complementary color
    let invertedR = 255 - r;
    let invertedG = 255 - g;
    let invertedB = 255 - b;

    // Slightly adjust the colors to create a more aesthetically pleasing combination
    let adjustment = 30;

    // Clamp values to ensure they are within valid RGB range (0-255)
    const clamp = (value) => Math.max(0, Math.min(255, value));

    // Apply the adjustment to make the color softer or more balanced
    let matchingR = clamp(invertedR + (r < 128 ? adjustment : -adjustment));
    let matchingG = clamp(invertedG + (g < 128 ? adjustment : -adjustment));
    let matchingB = clamp(invertedB + (b < 128 ? adjustment : -adjustment));

    return [matchingR, matchingG, matchingB];
}