require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./middlewares/logger');
const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(express.json());
app.use(cors({
  origin: /^http:\/\/localhost/,
  credentials: true
}));

// Логирование каждого запроса
app.use(logger);

// Подключение к MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library';

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI не найден в .env, используется значение по умолчанию:', MONGODB_URI);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Подключено к MongoDB:', MONGODB_URI);
})
.catch((err) => {
  console.error('Ошибка подключения к MongoDB:', err);
  console.error('Проверьте, что MongoDB запущена и доступна по адресу:', MONGODB_URI);
  // Не завершаем процесс, чтобы сервер мог запуститься и показать ошибку при запросе
});

// Корневой роут - информация об API
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Library API',
    version: '1.0.0',
    endpoints: {
      users: {
        'GET /users': 'Получить всех пользователей',
        'GET /users/:id': 'Получить пользователя по id',
        'POST /users': 'Создать пользователя',
        'PUT /users/:id': 'Обновить пользователя',
        'DELETE /users/:id': 'Удалить пользователя'
      },
      books: {
        'GET /books': 'Получить все книги',
        'GET /books/:id': 'Получить книгу по id',
        'POST /books': 'Создать книгу',
        'PUT /books/:id': 'Обновить книгу',
        'DELETE /books/:id': 'Удалить книгу'
      }
    }
  });
});

// Подключение роутов
app.use('/users', usersRouter);
app.use('/books', booksRouter);

// ==================== ERROR HANDLING ====================

// Обработка несуществующих роутов (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Роут не найден' });
});

// Обработка ошибок 500
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  console.error('Stack trace:', err.stack);
  console.error('Request URL:', req.originalUrl);
  console.error('Request method:', req.method);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Запуск сервера
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Сервер запущен на http://127.0.0.1:${PORT}`);
  console.log(`REST API доступно по адресу: http://127.0.0.1:${PORT}`);
});
