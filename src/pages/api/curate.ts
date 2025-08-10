import type { NextApiRequest, NextApiResponse } from 'next';
import { curateWithMistral } from '../../services/openrouterClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    const resp = await curateWithMistral(prompt);
    return res.status(200).json({ text: resp });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
