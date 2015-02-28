var express = require('express'),
    router = express.Router(),
    UserRepository = require('../repositories/user');

var userRepo = new UserRepository();

router.get('/', userRepo.getUser.bind(userRepo));

module.exports = router;