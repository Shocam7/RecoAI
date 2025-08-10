import type { SpotifyTrack } from '../types';

export function formatTracks(tracks: SpotifyTrack[]) {
  return tracks.map((t, idx) => `${idx + 1}. ${t.name} — ${t.artists.join(', ')}`);
}
