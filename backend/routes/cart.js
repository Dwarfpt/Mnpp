const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/admin');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Получить корзину пользователя
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');
        
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
            await cart.save();
        }
        
        res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

// Получить корзину конкретного пользователя (только для админов)
router.get('/user/:userId', auth, admin, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.params.userId })
            .populate('items.product');
        
        if (!cart) {
            return res.json({ items: [] });
        }
        
        res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

// Добавить товар в корзину
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        // Проверяем существование товара
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        const productIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (productIndex > -1) {
            cart.items[productIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        
        // Получаем обновленную корзину с данными о продуктах
        cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');

        res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

// Обновить количество товара
router.put('/update', auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        if (quantity < 1) {
            return res.status(400).json({ message: 'Количество должно быть больше 0' });
        }

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Корзина не найдена' });
        }

        const productIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Товар не найден в корзине' });
        }

        cart.items[productIndex].quantity = quantity;
        await cart.save();

        cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');

        res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

// Удалить товар из корзины
router.delete('/remove/:productId', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Корзина не найдена' });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== req.params.productId
        );

        await cart.save();
        
        const updatedCart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');

        res.json(updatedCart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

// Очистить корзину
router.delete('/clear', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Корзина не найдена' });
        }

        cart.items = [];
        await cart.save();

        res.json({ message: 'Корзина очищена' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});

module.exports = router;