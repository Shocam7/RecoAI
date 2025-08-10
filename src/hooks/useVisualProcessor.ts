import { useState } from 'react';
import type { SpotifyTrack } from '../types';

export default function useVisualProcessor() {
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrack[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function processImage(file: File) {
    setError(null);
    setLoading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch('/api/visual', { method: 'POST', body: form });
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

  return { loading, tracks, error, processImage };
}
