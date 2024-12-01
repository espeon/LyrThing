export default function getLyricStatus(
  currentTime: number,
  lyricStart: number,
  lyricEnd: number,
  offset: number = 0.1,
) {
  // Adjust current time with offset and ensure precision
  const adjustedTime = Number((currentTime + offset).toFixed(3));

  // Early return for cases outside lyric time range
  if (adjustedTime < lyricStart) {
    return {
      isActive: false,
      percentage: 0,
      secondsAfterActive: 0,
      secondsBeforeActive: lyricStart - adjustedTime,
    };
  }

  const isActive = adjustedTime < lyricEnd;

  if (isActive) {
    const duration = lyricEnd - lyricStart;
    const secondsAfterActive = adjustedTime - lyricStart;
    const percentage = Number(
      ((secondsAfterActive / duration) * 100).toFixed(2),
    );

    return {
      isActive,
      percentage,
      secondsAfterActive,
      secondsBeforeActive: 0,
    };
  }

  return {
    isActive: false,
    percentage: 100,
    secondsAfterActive: adjustedTime - lyricEnd,
    secondsBeforeActive: 0,
  };
}
