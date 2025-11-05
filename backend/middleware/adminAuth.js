const db = require('../database/db');

const adminAuthMiddleware = (req, res, next) => {
  try {
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено. Потрібні права адміністратора.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Помилка перевірки прав доступу' });
  }
};

module.exports = adminAuthMiddleware;
