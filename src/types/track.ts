interface Track {
    name: string;
    artist: string;
    image: BackgroundImage;
  }
  interface BackgroundImage {
    current: string;
    previous: string | null;
  }
  