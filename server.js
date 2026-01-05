require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Book = require('./models/Book');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(express.json());
app.use(cors({
  origin: /^http:\/\/localhost/,
  credentials: true
}));

// Логирование каждого запроса
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

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

// ==================== USERS ROUTES ====================

// Проверка подключения к MongoDB
const checkConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Сервис временно недоступен',
      message: 'Нет подключения к базе данных MongoDB'
    });
  }
  next();
};

// Получить всех пользователей
app.get('/users', checkConnection, async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// Получить пользователя по id
app.get('/users/:id', checkConnection, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    next(error);
  }
});

// Создать пользователя
app.post('/users', checkConnection, async (req, res, next) => {
  try {
    const { name, surname, username } = req.body;
    
    // Валидация
    if (!name || typeof name !== 'string' || name.length < 2 || name.length > 20) {
      return res.status(400).json({ error: 'Имя должно быть строкой от 2 до 20 символов' });
    }
    if (!surname || typeof surname !== 'string' || surname.length < 2 || surname.length > 20) {
      return res.status(400).json({ error: 'Фамилия должна быть строкой от 2 до 20 символов' });
    }
    if (!username || typeof username !== 'string' || username.length === 0 || username.length > 5) {
      return res.status(400).json({ error: 'Username должен быть строкой не более 5 символов' });
    }
    
    const newUser = new User({ name, surname, username });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username уже существует' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// Обновить пользователя
app.put('/users/:id', checkConnection, async (req, res, next) => {
  try {
    const { name, surname, username } = req.body;
    
    // Валидация
    if (name !== undefined) {
      if (typeof name !== 'string' || name.length < 2 || name.length > 20) {
        return res.status(400).json({ error: 'Имя должно быть строкой от 2 до 20 символов' });
      }
    }
    if (surname !== undefined) {
      if (typeof surname !== 'string' || surname.length < 2 || surname.length > 20) {
        return res.status(400).json({ error: 'Фамилия должна быть строкой от 2 до 20 символов' });
      }
    }
    if (username !== undefined) {
      if (typeof username !== 'string' || username.length > 5) {
        return res.status(400).json({ error: 'Username должен быть строкой не более 5 символов' });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, surname, username },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username уже существует' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// Удалить пользователя
app.delete('/users/:id', checkConnection, async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    next(error);
  }
});

// ==================== BOOKS ROUTES ====================

// Получить все книги
app.get('/books', checkConnection, async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
});

// Получить книгу по id
app.get('/books/:id', checkConnection, async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    res.status(200).json(book);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    next(error);
  }
});

// Создать книгу
app.post('/books', checkConnection, async (req, res, next) => {
  try {
    const { title, author, year } = req.body;
    
    // Валидация
    if (!title || typeof title !== 'string' || title.length < 2 || title.length > 20) {
      return res.status(400).json({ error: 'Заголовок должен быть строкой от 2 до 20 символов' });
    }
    if (!author || typeof author !== 'string' || author.length < 2 || author.length > 20) {
      return res.status(400).json({ error: 'Автор должен быть строкой от 2 до 20 символов' });
    }
    if (year === undefined || typeof year !== 'number') {
      return res.status(400).json({ error: 'Год выпуска должен быть числом' });
    }
    
    const newBook = new Book({ title, author, year });
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// Обновить книгу
app.put('/books/:id', checkConnection, async (req, res, next) => {
  try {
    const { title, author, year } = req.body;
    
    // Валидация
    if (title !== undefined) {
      if (typeof title !== 'string' || title.length < 2 || title.length > 20) {
        return res.status(400).json({ error: 'Заголовок должен быть строкой от 2 до 20 символов' });
      }
    }
    if (author !== undefined) {
      if (typeof author !== 'string' || author.length < 2 || author.length > 20) {
        return res.status(400).json({ error: 'Автор должен быть строкой от 2 до 20 символов' });
      }
    }
    if (year !== undefined && typeof year !== 'number') {
      return res.status(400).json({ error: 'Год выпуска должен быть числом' });
    }
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, year },
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    res.status(200).json(book);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// Удалить книгу
app.delete('/books/:id', checkConnection, async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    res.status(200).json(book);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    next(error);
  }
});

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
