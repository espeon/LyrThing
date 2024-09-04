import { useState, useEffect, useRef, useCallback } from "react";

interface UseSmoothTimerOptions {
  duration: number;
  currentTime: number;
  onUpdate?: (time: number) => void;
  isActivelyPlaying?: boolean;
  bounds?: [min: number, max: number];
}

export interface TimerControls {
  currentTime: number;
  resetTimer: () => void;
  setLocalTime: (time: number) => void;
}

export const useThrottle = (callback: Function, delay: number) => {
  const lastCall = useRef(0);

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
};

/**
 * Returns a set of controls for a smooth timer that interpolates between the current time and a given duration.
 *
 * @param {Object} options - An object containing the following properties:
 *   - {number} duration - The duration of the timer in seconds.
 *   - {number} currentTime - The current time of the timer in seconds.
 *   - {function} onUpdate - An optional callback function to be called whenever the timer updates.
 *   - {boolean} isActivelyPlaying - An optional flag indicating whether the timer is actively playing. Defaults to true.
 *   - {Array<number>} bounds - An optional array of two numbers representing the minimum and maximum bounds of the timer. Defaults to [0, Infinity].
 * @return {Object} An object containing the following properties:
 *   - {number} currentTime - The current time of the timer in seconds.
 *   - {function} resetTimer - A function to reset the timer to its initial state.
 *   - {function} setLocalTime - A function to set the timer to a specific time.
 */
export const useSmoothTimer = ({
  duration,
  currentTime,
  onUpdate,
  isActivelyPlaying = true,
  bounds = [0, Infinity],
}: UseSmoothTimerOptions): TimerControls => {
  const [internalTime, setInternalTime] = useState<number>(currentTime);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(currentTime);

  const updateTime = useCallback(() => {
    if (onUpdate) onUpdate(internalTime);
  }, [internalTime, onUpdate]);

  const throttledSetInternalTime = useThrottle((s) => {setInternalTime(s); updateTime()}, 150);

  useEffect(() => {
      if (
        !isActivelyPlaying ||
        internalTime < bounds[0] ||
        internalTime > bounds[1]
      ) {
        setInternalTime(currentTime);
        startTimeRef.current = null;
        startValueRef.current = currentTime;
        return;
      }

      if (startTimeRef.current === null) {
        startTimeRef.current = performance.now();
        startValueRef.current = currentTime;
      }

      const animate = (time: DOMHighResTimeStamp) => {
        if (startTimeRef.current !== null) {
          const elapsed = (time - startTimeRef.current) / 1000; // Convert ms to seconds
          const predicted = startValueRef.current + elapsed;
          const newTime = Math.min(predicted, duration);

          if (newTime !== internalTime) {
            throttledSetInternalTime(newTime);
          }

          if (predicted < duration) {
            animationRef.current = requestAnimationFrame(animate);
          }
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
  }, [
    isActivelyPlaying,
    currentTime,
    duration,
    bounds,
    internalTime,
    updateTime,
  ]);

  const resetTimer = () => {
    setInternalTime(currentTime);
    startTimeRef.current = null;
    startValueRef.current = currentTime;
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const setLocalTime = (time: number) => {
    setInternalTime(time);
    startTimeRef.current = null; // Reset the start time on manual set
    startValueRef.current = time;
  };

  return { currentTime: internalTime, resetTimer, setLocalTime };
};
