const mongoose = require('mongoose');

const checkConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Сервис временно недоступен',
      message: 'Нет подключения к базе данных MongoDB'
    });
  }
  next();
};

module.exports = checkConnection;

