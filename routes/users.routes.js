const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controllers');

router.post('/v1/auth/signup', usersController.signUp);
router.post('/v1/auth/signin', usersController.signIn);
router.get('/v1/auth/me', usersController.getMe);
router.get('/users', usersController.getUsers);
router.put('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);

module.exports = router;