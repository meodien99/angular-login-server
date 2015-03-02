var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus');

var user = function(){
    "use strict";

    var self = this;

    self.getUser = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var query = 'SELECT id,USER_NAME,IS_ONLINE,last_login_time,current_xclient_type, REGISTERED_DATE FROM xuser WHERE is_online=(1) and is_ai=(0)';
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };
};

module.exports = user;