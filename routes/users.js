const express = require('express');
const router = express.Router();
const checkConnection = require('../middlewares/checkConnection');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router.get('/', checkConnection, getUsers);
router.get('/:id', checkConnection, getUserById);
router.post('/', checkConnection, createUser);
router.put('/:id', checkConnection, updateUser);
router.delete('/:id', checkConnection, deleteUser);

module.exports = router;

