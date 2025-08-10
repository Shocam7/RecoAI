import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { processImageWithLlamaMaverick, curateWithMistral } from '../../services/openrouterClient';
import { searchTracks } from '../../services/spotifyClient';

// disable default body parser (we use formidable)
export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error parsing form' });
      }
      const file = files?.image as formidable.File | undefined;
      if (!file) return res.status(400).json({ error: 'No image uploaded (field name "image")' });

      // read file and convert to base64 inline (small images only; if large use direct multipart to model)
      const buf = fs.readFileSync(file.filepath);
      const b64 = `data:${file.mimetype};base64,${buf.toString('base64')}`;

      // 1) Describe the image with llama
      const imageDesc = await processImageWithLlamaMaverick(b64);

      // 2) Curate via mistral
      const mistralPrompt = `Image description:\n${imageDesc}\n\nCreate a playlist of up to 12 tracks that fit the image. Provide them as lines "Song - Artist" or short search queries.`;
      const mistralOut = await curateWithMistral(mistralPrompt);

      // 3) Extract candidate lines and search Spotify
      const lines = extractSongCandidates(mistralOut);
      const tracks = [];
      for (const line of lines.slice(0, 12)) {
        try {
          const results = await searchTracks(line, 1);
          if (results.length) tracks.push(results[0]);
        } catch (e) {
          // continue
        }
      }

      return res.status(200).json({ tracks });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: e?.message || 'Internal error' });
    }
  });
}

function extractSongCandidates(text: string): string[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const candidates: string[] = [];
  for (const l of lines) {
    const clean = l.replace(/^\d+\.\s*/, '').replace(/["“”]/g, '');
    if (clean.includes(' - ')) {
      candidates.push(clean);
    } else {
      candidates.push(clean.split('—')[0].trim());
    }
  }
  return candidates;
}
