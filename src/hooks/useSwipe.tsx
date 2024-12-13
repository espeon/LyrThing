// Heavy inspiration from react-swipe-detector, licensed under Apache 2.0.
// https://github.com/amirhrb/react-swipe-detector

import React, { useEffect, useState } from "react";

const THRESHOLD = 130;
const ALLOWED_TIME = 250;
const MIN_SECONDARY_DISTANCE = 100;

interface SwipeDirections {
  primaryDir: string | null;
  primaryDist: number | null;
  secondaryDir: string | null;
  secondaryDist: number | null;
}

const useSwipe = (elRef: React.RefObject<HTMLDivElement>) => {
  const [directions, setDirections] = useState<SwipeDirections>({
    primaryDir: null,
    primaryDist: null,
    secondaryDir: null,
    secondaryDist: null,
  });

  let startX = 0;
  let startY = 0;
  let startTime = 0;

  const touchStartHandler = (e: TouchEvent) => {
    const touchObj = e.changedTouches[0];
    startX = touchObj.pageX;
    startY = touchObj.pageY;
    startTime = Date.now();
  };

  const touchMoveHandler = (e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while interacting with the swipe area
  };

  const touchEndHandler = (e: TouchEvent) => {
    const touchObj = e.changedTouches[0];
    const distX = startX - touchObj.pageX;
    const distY = startY - touchObj.pageY;
    const elapsedTime = Date.now() - startTime;

    if (elapsedTime <= ALLOWED_TIME) {
      const absDistX = Math.abs(distX);
      const absDistY = Math.abs(distY);

      if (absDistY > THRESHOLD && absDistX < MIN_SECONDARY_DISTANCE) {
        setDirections({
          primaryDir: distY > 0 ? "up" : "down",
          primaryDist: absDistY,
          secondaryDir: distX > 0 ? "left" : "right",
          secondaryDist: absDistX,
        });
      } else if (absDistX > THRESHOLD && absDistY < MIN_SECONDARY_DISTANCE) {
        setDirections({
          primaryDir: distX > 0 ? "left" : "right",
          primaryDist: absDistX,
          secondaryDir: distY > 0 ? "up" : "down",
          secondaryDist: absDistY,
        });
      }
    }
  };

  useEffect(() => {
    const element = elRef.current;
    if (!element) return;

    element.addEventListener("touchstart", touchStartHandler);
    element.addEventListener("touchmove", touchMoveHandler);
    element.addEventListener("touchend", touchEndHandler);

    return () => {
      element.removeEventListener("touchstart", touchStartHandler);
      element.removeEventListener("touchmove", touchMoveHandler);
      element.removeEventListener("touchend", touchEndHandler);
    };
  }, [elRef]);

  return directions;
};

export default useSwipe;
