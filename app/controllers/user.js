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
    .get('/admin', userRepo.getAllAdmins.bind(userRepo))
    .post('/admin', userRepo.postAddAdminUser.bind(userRepo))
    //admin logs
    .get('/admin/logs', userRepo.getAdminLog.bind(userRepo))
    .put('/admin/:adminUser/changePermission', userRepo.putChangePermission.bind(userRepo))
    .post('/admin/:adminUser/changePassword', userRepo.postResetPassAdmin.bind(userRepo))
    .get('/admin/:adminUser', userRepo.getAdmin.bind(userRepo))
    .delete('/admin/:adminUser', userRepo.deleteAdminUser.bind(userRepo))
    //user reset password
    .post('/:username/change', userRepo.resetPassword.bind(userRepo))
    .post('/:username/status', userRepo.postUserStatus.bind(userRepo))
    .get('/:userID/logs', userRepo.getUserLog.bind(userRepo));


module.exports = router;