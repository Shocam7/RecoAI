import fetch from 'node-fetch';
import type { SpotifyTrack } from '../types';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.warn('SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not set. Set them in .env.local');
  }
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60 * 1000) {
    return cachedToken.token;
  }
  if (!CLIENT_ID || !CLIENT_SECRET) throw new Error('Spotify client credentials not configured');

  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error('Spotify token error: ' + txt);
  }

  const json = await resp.json();
  const token = json.access_token as string;
  const expiresIn = json.expires_in as number;
  cachedToken = { token, expiresAt: Date.now() + expiresIn * 1000 };
  return token;
}

/**
 * Search Spotify for a track by a text query, returns top results mapped to SpotifyTrack
 */
export async function searchTracks(query: string, limit = 5): Promise<SpotifyTrack[]> {
  const token = await getAccessToken();
  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.append('q', query);
  url.searchParams.append('type', 'track');
  url.searchParams.append('limit', String(limit));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Spotify search error: ' + txt);
  }

  const j = await res.json();
  const items = j.tracks?.items ?? [];
  const tracks: SpotifyTrack[] = items.map((t: any) => ({
    name: t.name,
    artists: (t.artists || []).map((a: any) => a.name),
    uri: t.uri,
    externalUrl: t.external_urls?.spotify ?? '',
    album: {
      name: t.album?.name,
      image: t.album?.images?.[0]?.url ?? null
    }
  }));
  return tracks;
}
