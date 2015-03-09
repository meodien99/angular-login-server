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
        var from = req.query.from;
        var to = req.query.to;
        console.log("CCU by time " +from +"-"+to);
        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var query = "SELECT * FROM ccu_log WHERE (date BETWEEN \""+ from +"\" AND \""+ to +"\") ORDER BY date DESC;";
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});
                console.log(rows);
                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };
};

module.exports = user;