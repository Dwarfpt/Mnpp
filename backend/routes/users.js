// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/admin');
const bcrypt = require('bcryptjs');

// @route   GET /api/users
// @desc    Получить список всех пользователей
// @access  Private/Admin
router.get('/', auth, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Исключаем пароль
        res.status(200).json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Серверная ошибка.' });
    }
});

// @route   POST /api/users
// @desc    Создать нового пользователя (через AdminPanel)
// @access  Private/Admin
router.post('/', auth, admin, async (req, res) => {
    const { username, email, password, role } = req.body;

    // Валидация
    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: 'Пожалуйста, заполните все поля.' });
    }

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Неверная роль пользователя.' });
    }

    try {
        // Проверка существования пользователя
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует.' });
        }

        // Хэширование пароля
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Создание нового пользователя с isVerified: true
        user = new User({
            username,
            email,
            password: hashedPassword,
            role,
            isVerified: true // Автоматически подтверждаем email для пользователей, созданных через админ панель
        });

        await user.save();

        res.status(201).json({ message: 'Пользователь успешно создан.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Серверная ошибка.' });
    }
});

// @route   PUT /api/users/:id/role
// @desc    Обновить роль пользователя
// @access  Private/Admin
router.put('/:id/role', auth, admin, async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    // Валидация роли
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Неверная роль пользователя.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

        user.role = role;
        await user.save();

        res.status(200).json({ message: `Роль пользователя ${user.username} обновлена на ${role}.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Серверная ошибка.' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Удалить пользователя
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

        // Удаление пользователя
        await user.deleteOne(); // Замена user.remove() на user.deleteOne()

        res.status(200).json({ message: 'Пользователь успешно удалён.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Серверная ошибка.' });
    }
});

// Обновление баланса пользователя (только для админов)
router.put('/balance/:userId', auth, admin, async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        user.balance += Number(amount);
        await user.save();

        res.json({ 
            message: 'Баланс успешно обновлен',
            newBalance: user.balance 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

module.exports = router;