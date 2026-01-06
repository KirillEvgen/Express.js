const User = require('../models/User');

// Получить всех пользователей
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Получить пользователя по id
const getUserById = async (req, res, next) => {
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
};

// Создать пользователя
const createUser = async (req, res, next) => {
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
};

// Обновить пользователя
const updateUser = async (req, res, next) => {
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
};

// Удалить пользователя
const deleteUser = async (req, res, next) => {
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
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

