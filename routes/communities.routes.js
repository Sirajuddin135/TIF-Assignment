const express = require('express');
const router = express.Router();
const communitiesController = require('../controllers/communities.controllers');

router.post('/v1/community', communitiesController.create);
router.get('/v1/community', communitiesController.getAll);
router.get('/v1/community/:id/members', communitiesController.getAllMembers);
router.get('/v1/community/me/owner', communitiesController.getMyOwnedCommunity);
router.get('/v1/community/me/member', communitiesController.getMyJoinedCommunity);

module.exports = router;