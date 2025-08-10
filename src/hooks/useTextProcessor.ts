import { useState } from 'react';
import type { SpotifyTrack } from '../types';

export default function useTextProcessor() {
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrack[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function processText(text: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setTracks(data.tracks ?? []);
      return data.tracks ?? [];
    } catch (e: any) {
      setError(e?.message ?? 'Unknown');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { loading, tracks, error, processText };
}
