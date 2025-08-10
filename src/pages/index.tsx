import React, { useState } from 'react';
import Head from 'next/head';
import TabSwitcher from '../components/TabSwitcher';
import TextInputForm from '../components/TextInputForm';
import ImageUploadForm from '../components/ImageUploadForm';
import PlaylistDisplay from '../components/PlaylistDisplay';
import type { SpotifyTrack } from '../types';

export default function Home() {
  const [active, setActive] = useState<'text' | 'visual'>('text');
  const [playlist, setPlaylist] = useState<SpotifyTrack[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTextSubmit(text: string) {
    setError(null);
    setLoading(true);
    setPlaylist(null);
    try {
      const res = await fetch('/api/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setPlaylist(data.tracks ?? []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleImageSubmit(file: File) {
    setError(null);
    setLoading(true);
    setPlaylist(null);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch('/api/visual', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setPlaylist(data.tracks ?? []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Head>
        <title>Reco</title>
        <meta name="description" content="Reco — playlist curator" />
      </Head>

      <main style={{ maxWidth: 800, margin: '24px auto', padding: '0 16px' }}>
        <h1>Reco</h1>
        <TabSwitcher active={active} onChange={setActive} />
        <div style={{ marginTop: 20 }}>
          {active === 'text' ? (
            <TextInputForm onSubmit={handleTextSubmit} loading={loading} />
          ) : (
            <ImageUploadForm onSubmit={handleImageSubmit} loading={loading} />
          )}
        </div>

        {loading && <p>Processing... this may take a few seconds.</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {playlist && <PlaylistDisplay tracks={playlist} />}
      </main>
    </div>
  );
}
