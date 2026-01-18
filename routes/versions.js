import express from 'express';

var router = express.Router();

const cache = {
  expiresAt: 0,
  data: null
};

router.get('/', async function(req, res) {
  try {
    const now = Date.now();
    if (cache.data && cache.expiresAt > now) {
      res.json(cache.data);
      return;
    }

    const apiUrl = 'https://api.github.com/repos/jaredlll08/MultiLoader-Template/branches?per_page=100';
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'McTemplates'
      }
    });

    if (!response.ok) {
      res.status(502).json({ error: 'Failed to fetch versions.' });
      return;
    }

    const branches = await response.json();
    const versions = branches
      .map((branch) => branch.name)
      .filter((name) => typeof name === 'string');

    const payload = { versions };
    cache.data = payload;
    cache.expiresAt = now + 10 * 60 * 1000;

    res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load versions.' });
  }
});

export default router;
