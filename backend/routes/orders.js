const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/admin');

// Создание заказа
router.post('/', auth, async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        const user = await User.findById(req.user.id);
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Корзина пуста' });
        }

        const totalAmount = cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        if (user.balance < totalAmount) {
            return res.status(400).json({ message: 'Недостаточно средств' });
        }

        const order = new Order({
            user: req.user.id,
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            totalAmount,
            shippingAddress
        });

        // Списываем средства
        user.balance -= totalAmount;
        await user.save();

        // Сохраняем заказ и очищаем корзину
        await order.save();
        cart.items = [];
        await cart.save();

        // Возвращаем обновленные данные
        res.status(201).json({ 
            message: 'Заказ успешно создан',
            order,
            userBalance: user.balance // Добавляем баланс в ответ
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});
// Получение заказов пользователя
router.get('/my', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

// Получение всех заказов (только для админов)
router.get('/', auth, admin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email')
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

module.exports = router;