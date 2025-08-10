export type SpotifyTrack = {
  name: string;
  artists: string[];
  uri: string;
  externalUrl: string;
  album?: {
    name?: string;
    image?: string | null;
  };
};
