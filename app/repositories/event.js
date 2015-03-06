var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus');

var event = function(){
    "use strict";

    var self = this;

    self.getEvents = function(req, res){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "SELECT * from xevent_hot ORDER BY `xevent_hot`.`created_date` DESC;;";

            connection.query(query, function(err, tasks){
                if(err){
                    console.log("ERROR: get Events  " + err)
                    return F.responseJson(res, err, {});
                }
                return F.responseJson(res, null, tasks, STATUS.OK);
            });
        });
    };
    self.createEvent = function(req, res){
        var from = req.query.from;
        var to = req.query.to;

        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }
        console.log(" get Card");
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "SELECT * from xevent_hot ORDER BY `xevent_hot`.`created_date` DESC;;";

            connection.query(query, function(err, tasks){
                if(err){
                    console.log("ERROR: get card by time " + err)
                    return F.responseJson(res, err, {});
                }
                return F.responseJson(res, null, tasks, STATUS.OK);
            });
        });
    };
    self.updateEvent = function(req, res){
        var from = req.query.from;
        var to = req.query.to;

        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }
        console.log(" get Card");
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "SELECT * from xevent_hot ORDER BY `xevent_hot`.`created_date` DESC;;";

            connection.query(query, function(err, tasks){
                if(err){
                    console.log("ERROR: get card by time " + err)
                    return F.responseJson(res, err, {});
                }
                return F.responseJson(res, null, tasks, STATUS.OK);
            });
        });
    };

};

module.exports = event;