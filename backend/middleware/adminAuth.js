const { dbWrapper } = require('../database/db-adapter');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const user = await dbWrapper.get('SELECT role FROM users WHERE id = ?', [req.userId]);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено. Потрібні права адміністратора.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Помилка перевірки прав доступу' });
  }
};

module.exports = adminAuthMiddleware;
