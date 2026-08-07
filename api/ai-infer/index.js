// api/ai-infer/index.js
// Vercel Serverless Function (Node.js)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send({ error: 'Method not allowed' });
  try {
    const { prompt, context, userId } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    // Placeholder reply — replace with OpenAI/Anthropic/etc. calls.
    const reply = `Server stub active. I received your prompt: "${prompt}"`;

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}
