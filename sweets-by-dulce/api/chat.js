export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      message,
      messages,
      systemPrompt,
      history,
      model,
      max_tokens,
      temperature,
      image_url
    } = req.body || {};

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY on server' });
    }

    let finalMessages = [];
    if (Array.isArray(messages) && messages.length) {
      finalMessages = messages;
    } else if (message) {
      if (systemPrompt) finalMessages.push({ role: 'system', content: String(systemPrompt) });
      if (Array.isArray(history) && history.length) finalMessages.push(...history);
      if (image_url) {
        finalMessages.push({ role: 'user', content: [
          { type: 'text', text: String(message) },
          { type: 'image_url', image_url: { url: image_url } }
        ] });
      } else {
        finalMessages.push({ role: 'user', content: String(message) });
      }
    } else {
      return res.status(400).json({ error: 'Missing message content' });
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: finalMessages,
        max_tokens: typeof max_tokens === 'number' ? max_tokens : 300,
        temperature: typeof temperature === 'number' ? temperature : 0.7
      })
    });

    const data = await groqRes.json();
    return res.status(groqRes.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
