const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check endpoint for Render / deployment verification
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI PR Description Generation endpoint
app.post('/api/generate-pr', async (req, res) => {
  try {
    const { diffText } = req.body;

    if (!diffText || typeof diffText !== 'string' || diffText.trim().length === 0) {
      return res.status(400).json({ error: 'Git diff text is required and cannot be empty.' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    const apiBase = process.env.OPENAI_API_BASE || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    
    if (!apiKey) {
      console.error('API key is missing in environment variables.');
      return res.status(500).json({ error: 'Server configuration error: AI API key not set on backend.' });
    }

    const prompt = `You are an expert software engineer assistant. Analyze the following git diff and generate a professional Pull Request description in Markdown format with these exact sections:
1. ### Summary of Changes (bullet points of what changed)
2. ### Why This Change Was Made (rationale and context)
3. ### Reviewer Checklist (key areas for code reviewers to verify)

Git Diff:
\`\`\`diff
${diffText.slice(0, 15000)}
\`\`\`
`;

    const fetchModule = global.fetch || require('node-fetch');
    const isProxy = apiBase.includes('manus.im');
    const apiEndpoint = isProxy ? `${apiBase}/chat/completions` : (process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1/chat/completions' : `${apiBase}/chat/completions`);
    const modelName = isProxy ? 'gpt-4.1-mini' : (process.env.OPENROUTER_API_KEY ? 'openai/gpt-4o-mini' : 'gpt-4.1-mini');

    const response = await fetchModule(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(process.env.OPENROUTER_API_KEY ? { 'HTTP-Referer': 'https://github.com/pr-scribe', 'X-Title': 'PR-Scribe' } : {})
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: 'You generate precise, senior-developer quality PR descriptions from git diffs.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI Provider Error:', errText);
      return res.status(502).json({ error: `AI provider responded with status ${response.status}: ${errText}` });
    }

    const data = await response.json();
    const resultMarkdown = data.choices?.[0]?.message?.content || 'No description generated.';

    res.json({ success: true, description: resultMarkdown });
  } catch (error) {
    console.error('Error generating PR description:', error);
    res.status(500).json({ error: 'Internal server error while processing the request.' });
  }
});

app.listen(PORT, () => {
  console.log(`PR-Scribe backend running on port ${PORT}`);
});
