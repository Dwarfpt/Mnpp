// backend/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/admin');

// @route   POST /api/products
// @desc    Создать новый товар
// @access  Private/Admin
router.post('/', auth, admin, async (req, res) => {
    const { name, description, price, imageUrl } = req.body;

    // Валидация
    if (!name || !description || !price) {
        return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля.' });
    }

    try {
        const newProduct = new Product({
            name,
            description,
            price,
            imageUrl,
            createdBy: req.user.id, // Передаём createdBy из req.user
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Серверная ошибка.' });
    }
});

// @route   GET /api/products
// @desc    Получить список всех товаров
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Серверная ошибка.' });
    }
});

// @route   PUT /api/products/:id
// @desc    Обновить товар
// @access  Private/Admin
router.put('/:id', auth, admin, async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, imageUrl } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден.' });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.imageUrl = imageUrl || product.imageUrl;

        await product.save();
        res.status(200).json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Серверная ошибка.' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Удалить товар
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден.' });
        }

        await product.remove();
        res.status(200).json({ message: 'Товар успешно удалён.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Серверная ошибка.' });
    }
});

// @route   GET /api/products/:id
// @desc    Получить отдельный товар
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден.' });
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Серверная ошибка.' });
    }
});

module.exports = router;
