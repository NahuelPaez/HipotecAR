const https = require('https');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  const decoded = decodeURIComponent(url);

  https.get(decoded, { headers: { 'User-Agent': 'HipotecAR/1.0' } }, (response) => {
    let body = '';
    response.on('data', chunk => body += chunk);
    response.on('end', () => {
      try {
        res.status(200).json(JSON.parse(body));
      } catch(e) {
        res.status(500).json({ error: 'JSON inválido', raw: body.substring(0, 200) });
      }
    });
  }).on('error', e => {
    res.status(500).json({ error: e.message });
  });
};

