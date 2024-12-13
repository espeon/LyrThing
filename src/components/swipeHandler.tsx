import React, { useEffect, useMemo, useState } from "react";

export const PAGES: PagesType[] = ["track", "lyrics"]; // List of pages in order

export type PagesType = "track" | "lyrics";

interface Props {
  currentMode: PagesType;
  setCurrentMode: React.Dispatch<React.SetStateAction<PagesType>>;
  directions: { primaryDir: string | null };
}

export const SwipeHandler: React.FC<Props> = ({
  currentMode,
  setCurrentMode,
  directions,
}) => {
  const [showNavMenu, setShowNavMenu] = useState(false);

  let currentIndex = useMemo(() => PAGES.indexOf(currentMode), [currentMode]);

  const navigatePage = (direction: "left" | "right" | "up" | "down") => {
    if (direction === "left" && currentIndex < PAGES.length - 1) {
      setCurrentMode(PAGES[currentIndex + 1]);
    } else if (direction === "right" && currentIndex > 0) {
      setCurrentMode(PAGES[currentIndex - 1]);
    } else if (direction === "up") {
      setShowNavMenu(true); // Show the lower-thirds nav menu on swipe up
    } else if (direction === "down") {
      setShowNavMenu(false); // Hide the nav menu on swipe down
    }
  };

  useEffect(() => {
    // Handle swipe directions
    if (directions.primaryDir === "left") {
      navigatePage("left");
    } else if (directions.primaryDir === "right") {
      navigatePage("right");
    } else if (directions.primaryDir === "up") {
      setShowNavMenu(true); // Show the lower-thirds nav menu on swipe up
    } else if (directions.primaryDir === "down") {
      setShowNavMenu(false); // Hide the nav menu on swipe down
    }
  }, [directions]);

  useEffect(() => {
    // Handle keyboard navigation
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        navigatePage("right");
      } else if (e.key === "ArrowRight") {
        navigatePage("left");
      }
    };

    window.addEventListener("keydown", keyHandler);
    return () => {
      window.removeEventListener("keydown", keyHandler);
    };
  }, [currentMode]);

  useEffect(() => {
    if (showNavMenu) {
      // timer, 2.5s
      setTimeout(() => {
        setShowNavMenu(false);
      }, 2500);
    }
  }, [showNavMenu]);

  if (showNavMenu) {
    return (
      <div className="fixed bottom-0 w-full h-1/6 z-10 px-16 animate-in slide-in-from-bottom">
        <div className={`grid grid-cols-3 items-center bg-neutral-400/70 rounded-full p-4`}>
          {currentIndex > 0 ? (
            <>
              <div className="text-3xl w-full  text-center" onClick={() => navigatePage("left")} onTouchStart={() => navigatePage("left")}>
                {PAGES[currentIndex - 1]}
              </div>
            </>
          ) : (
            <div className="w-full" /> // Empty div for alignment
          )}
          <div className="text-3xl font-bold w-full text-center">
            {PAGES[currentIndex]}
          </div>
          {currentIndex < PAGES.length - 1 ? (
            <div className="text-3xl w-full  text-center" onClick={() => navigatePage("right")} onTouchStart={() => navigatePage("right")}>
              {PAGES[currentIndex + 1]}
            </div>
          ) : (
            <div className="w-full" /> // Empty div for alignment
          )}
        </div>
      </div>
    );
  } else {
    return null;
  }
};
