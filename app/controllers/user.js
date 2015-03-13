var express = require('express'),
    router = express.Router(),
    UserRepository = require('../repositories/user');

var userRepo = new UserRepository();

router
    .get('/', userRepo.getUser.bind(userRepo))
    .get('/ccu', userRepo.getCCU.bind(userRepo))
    .get('/feedback', userRepo.getFeedback.bind(userRepo))
    .post('/user', userRepo.postFindUser.bind(userRepo))
    .get('/user/:username/change', userRepo.resetPassword.bind(userRepo));

module.exports = router;