const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controllers');

router.post('/v1/role', rolesController.create);
router.get('/v1/role', rolesController.getAll);

module.exports = router;