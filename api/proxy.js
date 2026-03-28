const https = require('https');
const http = require('http');

function get(url, callback, hops = 0) {
  if (hops > 5) return callback(new Error('Demasiados redirects'));
  const lib = url.startsWith('https') ? https : http;
  lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      const next = res.headers.location.startsWith('http')
        ? res.headers.location
        : new URL(res.headers.location, url).toString();
      return get(next, callback, hops + 1);
    }
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => callback(null, body));
  }).on('error', callback);
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url' });
  get(decodeURIComponent(url), (err, body) => {
    if (err) return res.status(500).json({ error: err.message });
    try {
      res.status(200).json(JSON.parse(body));
    } catch(e) {
      res.status(500).json({ error: 'JSON inválido', raw: body.substring(0, 300) });
    }
  });
};
