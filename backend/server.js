// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Разрешаем запросы с этого origin
    credentials: true, // Разрешаем отправку cookies
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // Разрешаем эти методы
    allowedHeaders: ['Authorization', 'Content-Type'] // Разрешаем эти заголовки
  }));


  app.options('/api/products', (req, res) => {
    res.set({
      'Content-Type': 'application/json', //  Добавляем Content-Type в заголовки ответа
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type'
    });
    res.status(204).send();
  });


app.use(express.json());

// Маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products')); // Маршруты для продуктов
app.use('/api/users', require('./routes/users')); // Маршруты для пользователей
app.use('/api/cart', require('./routes/cart')); 
app.use('/api/orders', require('./routes/orders')); // Добавляем маршрут для заказов
//app.use('/api/contact', require('./routes/contact')); // Маршруты для контактов

// Корневой маршрут
app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Проверка подключения к MongoDB и запуск сервера
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB подключен');
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Сервер запущен на порту ${PORT}`);
    });
})
.catch(err => {
    console.error('Ошибка подключения к MongoDB:', err.message);
    process.exit(1);
});
