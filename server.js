const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const HOST = '0.0.0.0';

const WORDS_FILE = path.join(__dirname, 'words.json');

function readWords() {
  try {
    const data = fs.readFileSync(WORDS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

function writeWords(words) {
  fs.writeFileSync(WORDS_FILE, JSON.stringify(words, null, 2), 'utf8');
}

function handleApi(req, res) {
  if (req.method === 'GET' && req.url === '/api/words') {
    const words = readWords();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(words));
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/words') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.connection.destroy();
      }
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const { word, pos, meaning, etymology, note } = data;

        if (!word || !meaning) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'word와 meaning은 필수입니다.' }));
          return;
        }

        const words = readWords();
        const newEntry = {
          id: Date.now(),
          word: String(word).trim(),
          pos: pos ? String(pos).trim() : '',
          meaning: String(meaning).trim(),
          etymology: etymology ? String(etymology).trim() : '',
          note: note ? String(note).trim() : ''
        };

        words.push(newEntry);
        writeWords(words);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newEntry));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '잘못된 JSON 데이터입니다.' }));
      }
    });
    return true;
  }

  return false;
}

const server = http.createServer((req, res) => {
  // Set cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.url.startsWith('/api/')) {
    const handled = handleApi(req, res);
    if (handled) return;
  }

  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Page Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
