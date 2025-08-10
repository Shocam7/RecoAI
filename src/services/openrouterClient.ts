import fetch from 'node-fetch';
import {
  OPENROUTER_CHAT_ENDPOINT,
  MISTRAL_MODEL,
  DEEPSEEK_MODEL,
  LLAMA_MAVERICK_MODEL
} from '../utils/constants';

const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  // don't throw at import time in dev build step; but warn
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.warn('OPENROUTER_API_KEY not set. Set it in .env.local');
  }
}

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function callOpenRouterChat(model: string, messages: ChatMessage[], max_tokens = 512) {
  if (!API_KEY) throw new Error('OpenRouter API key not configured');
  const body = {
    model,
    messages,
    max_tokens
  };

  const res = await fetch(OPENROUTER_CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error: ${res.status} ${text}`);
  }

  const j = await res.json();
  // openrouter responses can vary; try to extract assistant content
  const content =
    j?.choices?.[0]?.message?.content ??
    j?.choices?.[0]?.text ??
    j?.choices?.[0]?.delta?.content ??
    '';

  return content;
}

export async function processTextWithDeepseek(userText: string) {
  const messages = [
    { role: 'system', content: 'You are an assistant that extracts music mood and intent.' },
    { role: 'user', content: userText }
  ];
  return callOpenRouterChat(DEEPSEEK_MODEL, messages, 512);
}

export async function processImageWithLlamaMaverick(imageBase64OrUrl: string) {
  // We'll send the image description prompt to the llama model via chat
  // For a real multi-part file upload you might use another endpoint; this example sends an instruction referencing the image as "image" and expects textual description.
  const messages = [
    { role: 'system', content: 'You are an assistant that describes images in detail: mood, colors, objects, clothing/fashion, text in scene, and whether it looks like a media snippet (movie/TV/comic).' },
    { role: 'user', content: `Analyze this image: ${imageBase64OrUrl}\nPlease provide concise bullet points: mood, dominant colors, notable objects, fashion/clothing cues, text found and whether it appears to be a frame/snippet from media.` }
  ];
  return callOpenRouterChat(LLAMA_MAVERICK_MODEL, messages, 1024);
}

export async function curateWithMistral(prompt: string) {
  const messages = [
    { role: 'system', content: 'You are a playlist curator. Produce a list of 10-25 Spotify track suggestions and a short reason for each, based on the input description. Provide result as lines in the format: Song - Artist — reason' },
    { role: 'user', content: prompt }
  ];
  return callOpenRouterChat(MISTRAL_MODEL, messages, 1024);
}
