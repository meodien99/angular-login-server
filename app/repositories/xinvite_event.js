var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus'),
    bcrypt = require('bcrypt-nodejs'),
    jwt = require('jsonwebtoken');

var xInvite = function(){
    "use strict";

    var self = this;

    self.getTopTenInfo = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var query = 'SELECT *, FIND_IN_SET( cnt, (SELECT GROUP_CONCAT( cnt ORDER BY cnt DESC ) FROM xinvite_stats )) AS rank FROM xinvite_stats order by cnt desc limit 10';
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});
                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.getUserInfo = function(req, res, next){
        var username = (req.params.username === null) ? null : req.params.username;
        console.log(123);
        if(username == null){
            return F.responseJson(res, "Username must not empty", {}, STATUS.BAD_REQUEST);
        }
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var query = "SELECT *, FIND_IN_SET( cnt, ( SELECT GROUP_CONCAT( cnt ORDER BY cnt DESC ) FROM xinvite_stats ) ) AS rank FROM xinvite_stats where user_name=" + connection.escape(username);
            //console.log(query);
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});
                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };
};

module.exports = xInvite;