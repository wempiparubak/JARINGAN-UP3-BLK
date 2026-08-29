import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const DEFAULT_SPREADSHEET_ID = '1cQsWKZcQPtNPUCKEUIZDP2w7hatq0r6gWLvZ7gAv_ws';
const DEFAULT_GID = '1986723754';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Cached sheet data in memory for high performance
  let cachedData: { csv: string; timestamp: number } | null = null;
  const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

  // Proxy endpoint to fetch Google Sheets CSV reliably without CORS issues
  app.get('/api/sheet-data', async (req, res) => {
    try {
      const sheetId = (req.query.sheetId as string) || DEFAULT_SPREADSHEET_ID;
      const gid = (req.query.gid as string) || DEFAULT_GID;
      const forceFresh = req.query.fresh === 'true';

      const now = Date.now();
      if (!forceFresh && cachedData && now - cachedData.timestamp < CACHE_TTL_MS && sheetId === DEFAULT_SPREADSHEET_ID && gid === DEFAULT_GID) {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        return res.send(cachedData.csv);
      }

      let csvText = '';
      const csvUrl1 = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      const csvUrl2 = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;

      try {
        const response = await fetch(csvUrl1, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        if (response.ok) {
          csvText = await response.text();
        }
      } catch (e) {
        console.warn('Export format=csv failed, trying gviz...', e);
      }

      if (!csvText || csvText.includes('<HTML>')) {
        const response2 = await fetch(csvUrl2, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        if (response2.ok) {
          csvText = await response2.text();
        }
      }

      if (!csvText) {
        throw new Error('Tidak dapat mengunduh data CSV dari Google Sheets.');
      }

      if (sheetId === DEFAULT_SPREADSHEET_ID && gid === DEFAULT_GID) {
        cachedData = {
          csv: csvText,
          timestamp: now,
        };
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.send(csvText);
    } catch (error: any) {
      console.error('Error fetching sheet data:', error);
      res.status(500).json({
        error: 'Gagal mengambil data dari Google Sheets',
        message: error?.message || 'Terjadi kesalahan pada server saat mengunduh data.',
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Monitoring WO T&D Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
