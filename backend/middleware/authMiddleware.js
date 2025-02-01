// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Нет токена, авторизуйтесь.' });
    }

    const token = authHeader.split(' ')[1]; // Ожидаем формат "Bearer TOKEN"
    if (!token) {
        return res.status(401).json({ message: 'Нет токена, авторизуйтесь.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Предполагаем, что при создании токена в payload был объект user
        next();
    } catch (err) {
        console.error('Ошибка валидации токена:', err.message);
        res.status(401).json({ message: 'Токен недействителен.' });
    }
};


module.exports = auth;
