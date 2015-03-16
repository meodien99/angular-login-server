var express = require('express'),
    router = express.Router(),
    UserRepository = require('../repositories/user');

var userRepo = new UserRepository();

router
    .get('/', userRepo.getUser.bind(userRepo))
    .get('/ccu', userRepo.getCCU.bind(userRepo))
    .get('/feedback', userRepo.getFeedback.bind(userRepo))
    .post('/find', userRepo.postFindUser.bind(userRepo))
    //admin
    .get('/admin', userRepo.getAllAdmin.bind(userRepo))
    .post('/admin', userRepo.postAddAdminUser.bind(userRepo))
    .put('/admin/:adminUser/changePermission', userRepo.putChangePermission.bind(userRepo))
    .post('/admin/:adminUser/changePassword', userRepo.postResetPassAdmin.bind(userRepo))
    .delete('/admin/:adminUser', userRepo.deleteAdminUser.bind(userRepo))
    //user reset password
    .post('/:username/change', userRepo.resetPassword.bind(userRepo));

module.exports = router;