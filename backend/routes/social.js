const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Отримання активних соціальних мереж (публічний endpoint)
router.get('/', (req, res) => {
  try {
    const links = db.prepare(`
      SELECT platform, url
      FROM social_links
      WHERE is_active = 1 AND url != ''
      ORDER BY platform
    `).all();

    // Перетворюємо масив в об'єкт для зручності
    const linksObj = {};
    links.forEach(link => {
      linksObj[link.platform] = link.url;
    });

    res.json(linksObj);
  } catch (error) {
    console.error('Get social links error:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;
