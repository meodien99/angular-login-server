var bcrypt = require('bcrypt-nodejs'),
    F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus'),
    session = require('express-session'),
    express = require('express')
    ;

var authentication = function(){
    "use strict";
    var self  = this;

    self.authenticate = function(req, res, next) {
        var username = (req.body.username == null) ? null : req.body.username,
            password = (req.body.password == null) ? null : req.body.password ;

        if(username == null || password == null){
            return F.responseJson(res, "Username or password must be filled.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err) {
                return F.responseJson(res, err, {});
            }
            var queryUser = 'SELECT * FROM xadmin WHERE username=\''+username+'\' limit 1';
            connection.query(queryUser, function(err, admin){
                if(err){
                    return F.responseJson(res, err, {});
                }
                if(admin.length < 1){
                    return F.responseJson(res, "User not found", {}, STATUS.NOT_FOUND);
                }
                bcrypt.compare(password, admin[0].password, function(err, isMatch){
                    if(err)
                        return F.responseJson(res, err, {});
                    if(isMatch === true){
                        var userInfo = {
                            username : admin[0].username,
                            roles : ['Admin','User'],
                            email : admin[0].email,
                            token : admin[0].verificationToken
                        };
                        req.session.userInfo = userInfo;
                        express.request.user = userInfo;
                        return F.responseJson(res, null, userInfo, STATUS.OK);
                    } else {
                        return F.responseJson(res, "User password is not correct", {}, STATUS.NOT_FOUND);
                    }
                })
            });
        })
    };


};

module.exports = authentication;