import React from 'react';
import type { SpotifyTrack } from '../types';

export default function PlaylistDisplay({ tracks }: { tracks: SpotifyTrack[] }) {
  if (!tracks.length) return <p>No tracks found.</p>;

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Curated Playlist</h2>
      <ol>
        {tracks.map((t) => (
          <li key={t.uri} style={{ marginBottom: 12 }}>
            <div>
              <strong>{t.name}</strong> — {t.artists.join(', ')}
            </div>
            <div>
              <a href={t.externalUrl} target="_blank" rel="noreferrer">
                Open on Spotify
              </a>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
