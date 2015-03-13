var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus');

var user = function(){
    "use strict";

    var self = this;

    self.getUser = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var query = 'SELECT id,USER_NAME,IS_ONLINE,last_login_time,current_xclient_type,REGISTERED_DATE FROM xuser WHERE is_online=(1) and is_ai=(0)';
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});
                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.getCCU = function(req, res, next){
        var from = (req.query.from === null) ? null : req.query.from.replace('"','').replace('T',' ').slice(0,19);
        var to = (req.query.to === null) ? null : req.query.to.replace('"','').replace('T',' ').slice(0,19);
        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var query = "SELECT * FROM ccu_log WHERE (date BETWEEN "+ connection.escape(from) +" AND "+ connection.escape(to) +") ORDER BY date ;";
            //console.log(query);
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});
                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.getFeedback = function(req, res, next){
        var from = (req.query.from === null)  ? null : req.query.from.replace('"','').replace('T',' ').slice(0,19);
        var to = (req.query.to === null) ? null : req.query.to.replace('"','').replace('T',' ').slice(0,19);
        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var query = "SELECT f.`id`, f.`user_name`, f.`created_date`, f.`content`, `xuser`.`xclient_type` FROM user_feedback f INNER JOIN `xuser` ON  f.`user_name` = `xuser`.`USER_NAME` WHERE (created_date BETWEEN "+ connection.escape(from) +" AND "+ connection.escape(to) +") ORDER BY f.id DESC;";
            //console.log(query);
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    /*
     * ============================== USER =========================================
     * */

    self.postFindUser = function(req, res, next){
        var username = (req.body.username === null)? null : req.body.username;

        if(username == null){
            return F.responseJson(res, "Username is not empty.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "SELECT * FROM `xuser` WHERE `USER_NAME` = " + connection.escape(username);

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                if(rows.length < 1){
                    return F.responseJson(res, "User not found.", null, STATUS.NOT_FOUND);
                }

                return F.responseJson(res, null , rows, STATUS.OK);
            });
        });
    };

    self.resetPassword = function(req, res, next){
        var username = (req.params.username === null ) ? null : req.params.username;
        var nPassword = (req.body.nPassword === null ) ? null : req.body.nPassword;

        if(username === null || nPassword === null){
            return F.responseJson(res, "Password is required.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "UPDATE `xuser` SET `password`=" + connection.escape(nPassword) + " WHERE `USER_NAME`=" + connection.escape(username);

            connection.query(query, function(err, row){
                if(err)
                    return F.responseJson(res, err, {});

                //log
                F.logger(connection, req, "Change user password  : " + username);

                return F.responseJson(res, null , row, STATUS.OK);
            });
        });
    }
};

module.exports = user;