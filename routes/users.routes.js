const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controllers');

router.post('/users', usersController.signUp);
router.get('/users', usersController.getUsers);
router.put('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);

module.exports = router;