// backend/middleware/admin.js
const auth = require('./authMiddleware');

const admin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Доступ запрещен. Администратор только.' });
    }
    next();
};

module.exports = admin;
