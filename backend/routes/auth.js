const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const { sendVerificationEmail } = require('../utils/emailService');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/admin');

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Валидация
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Некорректный email адрес' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        user = new User({
            username,
            email,
            password: hashedPassword,
            role: 'user',
            isVerified: false,
            isTestAccount: false
        });

        await user.save();

        // Генерируем код подтверждения
        const verificationCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        
        const verification = new VerificationCode({
            user: user._id,
            code: verificationCode
        });
        await verification.save();

        try {
            await sendVerificationEmail(email, verificationCode);
        } catch (emailError) {
            console.error('Ошибка отправки email:', emailError);
            await User.deleteOne({ _id: user._id });
            await VerificationCode.deleteOne({ user: user._id });
            return res.status(500).json({ message: 'Ошибка отправки email. Попробуйте позже.' });
        }

        res.status(201).json({ 
            message: 'Пользователь создан. Проверьте email для подтверждения.',
            userId: user._id 
        });
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

// Подтверждение email
router.post('/verify', async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const verification = await VerificationCode.findOne({ 
            user: user._id,
            code: code
        });

        if (!verification) {
            return res.status(400).json({ message: 'Неверный код подтверждения' });
        }

        user.isVerified = true;
        await user.save();
        await verification.deleteOne();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

// Вход в систему
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        if (!user.isVerified && !user.isTestAccount) {
            return res.status(403).json({ 
                message: 'Email не подтвержден. Проверьте почту для подтверждения.',
                userId: user._id
            });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

// Получение информации о текущем пользователе
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

// Создание администратора (только для админов)
router.post('/register-admin', auth, admin, async (req, res) => {
    const { username, email, password, isTestAccount = false } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin',
            isVerified: isTestAccount,
            isTestAccount
        });

        await user.save();

        if (!isTestAccount) {
            const verificationCode = Math.random().toString(36).substring(2, 6).toUpperCase();
            const verification = new VerificationCode({
                user: user._id,
                code: verificationCode
            });
            await verification.save();
            await sendVerificationEmail(email, verificationCode);
        }

        res.status(201).json({ message: 'Администратор успешно создан' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});


// Создание первоначального администратора (через GET запрос)
router.get('/create-initial-admin', async (req, res) => {
    try {
        const adminData = {
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            isVerified: true,
            isTestAccount: true
        };

        // Проверяем, существует ли уже админ
        let admin = await User.findOne({ email: adminData.email });
        if (admin) {
            return res.json({ 
                message: 'Администратор уже существует',
                credentials: {
                    email: adminData.email,
                    password: 'admin123'
                }
            });
        }

        // Создаем нового админа
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        admin = new User({
            ...adminData,
            password: hashedPassword
        });

        await admin.save();

        res.status(201).json({
            message: 'Администратор успешно создан',
            credentials: {
                email: adminData.email,
                password: 'admin123'
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

module.exports = router;

