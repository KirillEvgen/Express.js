const express = require('express');
const router = express.Router();
const checkConnection = require('../middlewares/checkConnection');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');

router.get('/', checkConnection, getBooks);
router.get('/:id', checkConnection, getBookById);
router.post('/', checkConnection, createBook);
router.put('/:id', checkConnection, updateBook);
router.delete('/:id', checkConnection, deleteBook);

module.exports = router;

