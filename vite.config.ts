import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

const K = [0x4b, 0x72, 0x1a, 0x5e, 0x33, 0x6d, 0x0f, 0x41, 0x28, 0x59];

function encodeAssetId(id: string): string {
  if (!id) return '';
  const payload = Date.now().toString(36) + '.' + id;
  const bytes: number[] = [];
  for (let i = 0; i < payload.length; i++) {
    bytes.push(payload.charCodeAt(i) ^ K[i % K.length]);
  }
  return Buffer.from(String.fromCharCode(...bytes), 'binary')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function commentsApiPlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'data');
  const commentsFile = path.join(dataDir, 'comments.json');

  const getMap = (): Record<string, any[]> => {
    try {
      if (fs.existsSync(commentsFile)) {
        return JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));
      }
    } catch (e) {
      console.error('Error reading comments file', e);
    }
    return {};
  };

  const saveMap = (map: Record<string, any[]>) => {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(commentsFile, JSON.stringify(map, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing comments file', e);
    }
  };

  return {
    name: 'comments-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/comments')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const rawLectureId = url.pathname.replace(/^\/api\/comments\/?/, '');
        const lectureId = decodeURIComponent(rawLectureId || 'default');

        if (req.method === 'GET') {
          const map = getMap();
          const comments = map[lectureId] || [];
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, comments }));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              if (!data.text || !data.text.trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Comment cannot be blank' }));
                return;
              }
              const map = getMap();
              if (!map[lectureId]) {
                map[lectureId] = [];
              }
              const newComment = {
                id: 'cm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
                author: data.author || 'Student',
                text: data.text.trim(),
                userId: data.userId || null,
                timestamp: Date.now(),
                createdAt: new Date().toISOString(),
              };
              map[lectureId].unshift(newComment);
              saveMap(map);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, comment: newComment, comments: map[lectureId] }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });

      // TPStreams Video Player Reverse-Proxy (Strips X-Frame-Options to fix "refused to connect")
      server.middlewares.use('/api/tpstreams-player', async (req: any, res: any) => {
        const url = new URL(req.url, 'http://localhost');
        const asset = url.searchParams.get('asset') || '';
        let token = url.searchParams.get('token') || '';
        const userToken = url.searchParams.get('userToken') || '';
        const org = url.searchParams.get('org') || 'kuepke';

        if (!asset) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end('<div style="color:#fff;background:#000;padding:20px;text-align:center;font-family:sans-serif;">Missing video asset</div>');
          return;
        }

        // Try fetching access token from TargetBoard DigitalOcean backend if not provided
        if (!token && userToken) {
          try {
            const tbRes = await fetch(`https://seashell-app-3z5jp.ondigitalocean.app/api/v1/tpstreams/token/${encodeURIComponent(asset)}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`,
                'Origin': 'https://targetboard.co.in',
                'Referer': 'https://targetboard.co.in/',
              },
            });
            if (tbRes.ok) {
              const tbData = await tbRes.json();
              if (tbData.code) {
                token = tbData.code;
              }
            }
          } catch (err) {
            console.error('Error fetching TPStreams token in proxy', err);
          }
        }

        const targetUrl = token
          ? `https://app.tpstreams.com/embed/${org}/${encodeURIComponent(asset)}/?access_token=${encodeURIComponent(token)}`
          : `https://app.tpstreams.com/embed/${org}/${encodeURIComponent(asset)}/`;

        try {
          const fetchRes = await fetch(targetUrl, {
            headers: {
              'Referer': 'https://targetboard.co.in/',
              'Origin': 'https://targetboard.co.in',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          });

          let html = await fetchRes.text();

          // If TPStreams returns 404/error, provide in-player login message and trigger
          if (!fetchRes.ok || html.includes('Not Found')) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TargetBoard Lecture Player</title>
  <style>
    body {
      margin: 0;
      background: #090d16;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 16px;
      box-sizing: border-box;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 24px 20px;
      max-width: 360px;
      width: 100%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: #10b981;
      color: #042f2e;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    h3 { font-size: 16px; margin: 0 0 6px; font-weight: 700; color: #f8fafc; }
    p { font-size: 13px; color: #94a3b8; margin: 0 0 16px; line-height: 1.4; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #10b981;
      color: #022c22;
      font-weight: 700;
      font-size: 13px;
      padding: 11px 22px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s;
    }
    .btn:hover { background: #34d399; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    </div>
    <h3>TargetBoard Login Required</h3>
    <p>Please log in with your TargetBoard mobile number to watch this lecture inside the player.</p>
    <button class="btn" onclick="window.parent.postMessage('OPEN_TB_LOGIN', '*')">
      ▶ Login to Watch Lecture
    </button>
  </div>
</body>
</html>`);
            return;
          }

          // Inject base tag so all relative assets (JS, CSS, player bundles) load from app.tpstreams.com
          const baseTag = `<base href="https://app.tpstreams.com/embed/${org}/${encodeURIComponent(asset)}/" />`;
          if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>${baseTag}`);
          } else {
            html = `<head>${baseTag}</head>` + html;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.removeHeader?.('x-frame-options');
          res.removeHeader?.('content-security-policy');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(html);
        } catch (err: any) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(`<div style="color:#fff;background:#000;padding:20px;text-align:center;font-family:sans-serif;">Player error: ${err.message}</div>`);
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), commentsApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/tb': {
          target: 'https://seashell-app-3z5jp.ondigitalocean.app/api/v1',
          changeOrigin: true,
          headers: {
            origin: 'https://targetboard.co.in',
            referer: 'https://targetboard.co.in/',
          },
          rewrite: (path) => path.replace(/^\/api\/tb/, ''),
        },
      },
    },
  };
});
