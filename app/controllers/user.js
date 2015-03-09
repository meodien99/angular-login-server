var express = require('express'),
    router = express.Router(),
    UserRepository = require('../repositories/user');

var userRepo = new UserRepository();

router.get('/', userRepo.getUser.bind(userRepo));
router.get('/ccu', userRepo.getCCU.bind(userRepo));

module.exports = router;