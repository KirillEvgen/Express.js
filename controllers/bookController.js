const Book = require('../models/Book');

// Получить все книги
const getBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

// Получить книгу по id
const getBookById = async (req, res, next) => {
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
};

// Создать книгу
const createBook = async (req, res, next) => {
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
};

// Обновить книгу
const updateBook = async (req, res, next) => {
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
};

// Удалить книгу
const deleteBook = async (req, res, next) => {
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
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};

