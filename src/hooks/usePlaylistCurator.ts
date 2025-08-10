import { useState } from 'react';
import type { SpotifyTrack } from '../types';

export default function usePlaylistCurator() {
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrack[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function curate(prompt: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      // Not converting to Spotify tracks here — client can call /api/spotify as needed
      return data.text;
    } finally {
      setLoading(false);
    }
  }

  return { loading, tracks, error, curate, setTracks };
}
