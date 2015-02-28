var express = require('express'),
    router = express.Router(),
    AuthRepository = require('../repositories/authenticate');

var Auth = new AuthRepository();

router
    .post('/login', Auth.authenticate.bind(Auth))
;

module.exports = router;
