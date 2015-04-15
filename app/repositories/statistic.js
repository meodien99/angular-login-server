var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus');

var statistic = function(){
    "use strict";

    var self = this;

    self.newUserByTime = function(req, res, next){
        var from = req.query.from;
        var to = req.query.to;
        if(from == null || to == null){
            return F.responseJson(res, "Amount or Type must be filled.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var selectQuery = "SELECT u.*, `xuser_game_data`.`played_time`/3600 AS played_time FROM `xuser` u INNER JOIN `xuser_game_data` ON u.`ID` = `xuser_game_data`.`xuser_id`  WHERE `xuser_game_data`.`xgame_type_id`=12 AND (u.REGISTERED_DATE BETWEEN \""+ from +"\" AND \""+ to +"\" and u.is_ai=(0));";

            connection.query(selectQuery, function(err, rows){
                if(err){
                    console.log(err);
                    return F.responseJson(res, err, {});
                }
                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.activeUserByTime = function(req, res, next){
        var from = req.query.from;
        var to = req.query.to;
        if(from == null || to == null){
            return F.responseJson(res, "Amount or Type must be filled.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var selectQuery = "SELECT u.*, `xuser_game_data`.`played_time`/3600 AS played_time FROM `xuser` u INNER JOIN `xuser_game_data` ON u.`ID` = `xuser_game_data`.`xuser_id`  WHERE `xuser_game_data`.`xgame_type_id`=12 AND (u.last_login_time BETWEEN \""+ from +"\" AND \""+ to +"\" and u.is_ai=(0));";

            connection.query(selectQuery, function(err, rows){
                if(err){
                    console.log(err);
                    return F.responseJson(res, err, {});
                }
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
            //console.log(query);
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

            var query = "SELECT xgame_task.name, COUNT(*) as amount FROM xgame_task INNER JOIN xgame_task_user ON xgame_task.id = xgame_task_user.xgame_task_id WHERE (xgame_task_user.completed_time BETWEEN \""+ from +"\" AND \""+ to +"\")  group by xgame_task_user.xgame_task_id";

            connection.query(query, function(err, tasks){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, tasks, STATUS.OK);
            });
        });
    };

    self.getCCUByTime = function(req, res, next){
        var from = req.query.from;
        var to = req.query.to;

        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "SELECT * FROM `ccu_log` WHERE (`date` BETWEEN \""+ from +"\" AND \""+ to +"\") ORDER BY `date` ASC";
            connection.query(query, function(err, tasks){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, tasks, STATUS.OK);
            });
        });
    }
};

module.exports = statistic;