const express = require('express');
const router = express.Router();
const membersController = require('../controllers/members.controllers');

router.post('/v1/member', membersController.addMember);
router.delete('/v1/member/:id', membersController.removeMember);

module.exports = router;