import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';

const PORT = 3000;
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxv_LnzrD7mTAAoQYYgEZjdcW8cCNcVoEu1rPCEU2V-EGMaiRLtGRU3yv3sV3WPkeUZTA/exec';

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API proxy route to fetch student data from Google Apps Script without CORS / Origin 403
  app.get('/api/sheet-data', async (req, res) => {
    try {
      const customUrl = (req.query.url as string) || GOOGLE_SCRIPT_URL;
      const cleanUrl = customUrl.trim().startsWith('https://script.google.com/')
        ? customUrl.trim()
        : GOOGLE_SCRIPT_URL;

      const sep = cleanUrl.includes('?') ? '&' : '?';
      const targetUrl = `${cleanUrl}${sep}_t=${Date.now()}`;

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Google Apps Script returned ${response.status}` });
      }

      const text = await response.text();

      // Check if valid JSON array
      try {
        const data = JSON.parse(text);
        return res.json(data);
      } catch {
        // Strip JSONP callback if any e.g. cb(...)
        const match = text.match(/^[a-zA-Z0-9_$]+\(([\s\S]*)\);?$/);
        if (match) {
          const innerData = JSON.parse(match[1]);
          return res.json(innerData);
        }
        return res.status(500).json({ error: 'Invalid response format from Google Apps Script' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown proxy error';
      return res.status(500).json({ error: msg });
    }
  });

  // API proxy route to log student login to Sheet 2
  app.post('/api/log-login', async (req, res) => {
    try {
      const payload = req.body;
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });
      const responseText = await response.text();
      return res.json({ success: true, response: responseText });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown logging error';
      return res.status(500).json({ error: msg });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // In development, attach Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
