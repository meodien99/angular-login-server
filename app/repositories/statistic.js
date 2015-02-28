var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus');

var statistic = function(){
    "use strict";

    var self = this;

    function getQueryInTimeRange(table, field,amount,type){
        var query = "SELECT COUNT("+ field +") AS amount FROM `"+ table +"` where ("+ field +" BETWEEN DATE_SUB(NOW(), INTERVAL "+ parseInt(amount) +" "+ type.toUpperCase() + ") AND  NOW()) AND is_ai=(0)";

        return query;
    };
    function getQueryFromTimeToTime(table, field, fromTime, toTime){
        var query = 'SELECT COUNT('+ field +') AS amount FROM `'+ table +'` WHERE ('+ field +' BETWEEN \"'+ fromTime +'\" AND \"'+ toTime +'\") AND is_ai=(0)';
            //query = 'SELECT COUNT(REGISTERED_DATE) AS amount FROM `xuser` USE INDEX(REGISTERED_DATE) WHERE (REGISTERED_DATE BETWEEN "2015-02-07" AND "2015-02-08") AND is_ai=(0)';
        return query;
    };

    self.testFunc = function(req, res, next){
        return res.json({r:123});
    };
    self.newUserByRanger = function(req, res, next){
        var fromTime = req.query.from;
        var toTime = req.query.to;
        if(fromTime == null || toTime == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var selectQuery = getQueryFromTimeToTime("xuser","REGISTERED_DATE", fromTime, toTime);
            console.log(selectQuery);
            connection.query(selectQuery, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.newUserByTime = function(req, res, next){
        var amount = req.query.amount;
        var type = req.query.type;

        if(amount == null || type == null){
            return F.responseJson(res, "Amount or Type must be filled.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});


            var selectQuery = getQueryInTimeRange("xuser", "REGISTERED_DATE", amount, type);
            console.log(selectQuery);
            connection.query(selectQuery, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.playedUserByRange = function(req, res, next){
        var fromTime = req.query.from;
        var toTime = req.query.to;

        if(fromTime == null || toTime == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var selectQuery = getQueryFromTimeToTime("xuser","last_login_time", fromTime, toTime);

            connection.query(selectQuery, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.playedUserByTime = function(req, res, next){
        var amount = req.query.amount;
        var type = req.query.type;

        if(amount == null || type == null){
            return F.responseJson(res, "Amount or Type must be filled.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var selectQuery = getQueryInTimeRange("xuser", "last_login_time", amount, type);
            connection.query(selectQuery, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.totalGamePlayedByTime = function(req, res, next){
        var time = req.query.amount;
        var t = req.query.type;

        if(time == null || t == null){
            return F.responseJson(res, "Time or Type must be filled.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "SELECT u.xgame_type_id as type_id,g.NAME as name,(sum(won)+sum(loss)+sum(draw)+sum(quit)) as amount FROM `xuser_game_data_daily` as u LEFT JOIN xgame_type as g ON g.id=u.xgame_type_id LEFT JOIN xuser as xu ON u.xuser_id=xu.id WHERE ((u.track_date BETWEEN DATE_SUB(NOW(), INTERVAL "+ parseInt(time) +" "+ t.toUpperCase() +") AND NOW()) AND g.visible=1 AND xu.is_ai=(0)) group by u.xgame_type_id";
            console.log(query);
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.totalGamePlayedByRange = function(req, res, next){
        var from = req.query.from;
        var to = req.query.to;

        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }


        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "SELECT u.xgame_type_id as type_id,g.NAME as name,(sum(won)+sum(loss)+sum(draw)+sum(quit)) as amount FROM `xuser_game_data_daily` as u INNER JOIN xgame_type as g ON g.id=u.xgame_type_id WHERE (u.track_date BETWEEN \""+ from +"\" AND \""+ to +"\") AND g.visible=1 group by u.xgame_type_id";

            connection.query(query, function(err, games){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, games, STATUS.OK);
            });
        });
    };

    self.getTaskByTime = function(req, res, next){
        var from = req.query.from;
        var to = req.query.to;


        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }


        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "";

            connection.query(query, function(err, games){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, games, STATUS.OK);
            });
        });
    };
};

module.exports = statistic;