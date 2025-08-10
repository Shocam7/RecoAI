import type { NextApiRequest, NextApiResponse } from 'next';
import { searchTracks } from '../../services/spotifyClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const q = (req.query.q as string) || null;
    if (!q) return res.status(400).json({ error: 'q query param required' });

    const results = await searchTracks(q, 10);
    return res.status(200).json({ results });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
