import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { getModeConfig, Mode } from '../../lib/modes';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, mode } = req.body as { 
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    mode: Mode;
  };

  if (!messages || !mode) {
    return res.status(400).json({ error: 'Missing messages or mode' });
  }

  const modeConfig = getModeConfig(mode);
  
  if (!modeConfig) {
    return res.status(400).json({ error: 'Invalid mode' });
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: modeConfig.systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      ],
      stream: true,
      max_completion_tokens: 8192
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to process chat request', details: errorMessage });
  }
}
