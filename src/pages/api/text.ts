import type { NextApiRequest, NextApiResponse } from 'next';
import { processTextWithDeepseek, curateWithMistral } from '../../services/openrouterClient';
import { searchTracks } from '../../services/spotifyClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text string required' });
    }

    // 1) Process text with deepseek-chat
    const deepseekOut = await processTextWithDeepseek(text);

    // 2) Ask mistral to curate playlist using deepseek output
    const mistralPrompt = `Source info:\n${deepseekOut}\n\nMake a playlist brief: provide a list of 10 songs or less in a simple "Title - Artist" list, optionally short keywords for search.`;
    const mistralOut = await curateWithMistral(mistralPrompt);

    // 3) From mistralOut, extract candidate lines and search Spotify for each
    const lines = extractSongCandidates(mistralOut);
    const tracks = [];

    for (const line of lines.slice(0, 12)) {
      try {
        const results = await searchTracks(line, 1);
        if (results.length) tracks.push(results[0]);
      } catch (e) {
        // ignore single search failures
      }
    }

    return res.status(200).json({ tracks });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message ?? 'Internal error' });
  }
}

function extractSongCandidates(text: string): string[] {
  // naive: split lines and keep lines that look like "Song - Artist" or are non-empty
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const candidates: string[] = [];
  for (const l of lines) {
    // drop numbering like "1." at start
    const clean = l.replace(/^\d+\.\s*/, '').replace(/["“”]/g, '');
    // if it contains ' - ' then use it directly
    if (clean.includes(' - ')) {
      candidates.push(clean);
    } else {
      // otherwise push short phrase as search query
      candidates.push(clean.split('—')[0].trim());
    }
  }
  return candidates;
}
