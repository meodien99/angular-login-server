var express = require('express'),
    router = express.Router(),
    XInviteRepository = require('../repositories/xinvite_event');

var xInvite = new XInviteRepository();

router
    .get('/xinvite', xInvite.getTopTenInfo.bind(xInvite))
    .post('/xinvite', xInvite.postUserInfo.bind(xInvite))
;

module.exports = router;

