var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus'),
    bcrypt = require('bcrypt-nodejs'),
    jwt = require('jsonwebtoken');

var user = function(){
    "use strict";

    var self = this;

    self.getUser = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var query = 'SELECT u.*, `xuser_game_data`.`played_time`/3600 AS played_time FROM `xuser` u INNER JOIN `xuser_game_data` ON u.`ID` = `xuser_game_data`.`xuser_id`  WHERE `xuser_game_data`.`xgame_type_id`=12 AND u.is_online=(1) and u.is_ai=(0)';
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});
                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.getCCU = function(req, res, next){
        var from = (req.query.from === null) ? null : req.query.from;
        var to = (req.query.to === null) ? null : req.query.to;
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
        var from = (req.query.from === null)  ? null : req.query.from;
        var to = (req.query.to === null) ? null : req.query.to;

        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var query = "SELECT f.`id`, f.`user_name`, f.`created_date`, f.`content`, `xuser`.`xclient_type` FROM user_feedback f INNER JOIN `xuser` ON  f.`user_name` = `xuser`.`USER_NAME` WHERE (created_date BETWEEN "+ connection.escape(from) +" AND "+ connection.escape(to) +") ORDER BY f.id DESC;";
            console.log(query);
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

            var query = "SELECT  `xuser`.*, `xuser_game_data`.`played_time`/3600 AS played_time FROM `xuser` INNER JOIN `xuser_game_data` ON `xuser`.`ID` = `xuser_game_data`.`xuser_id` WHERE `xuser_game_data`.`xgame_type_id`=12 AND `USER_NAME` = " + connection.escape(username);

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

    self.postUserStatus = function(req, res, next){
        var username = (req.params.username === null)? null : req.params.username;
        var status = (req.body.status === null) ? null : req.body.status;
        if(username == null){
            return F.responseJson(res, "Username is not empty.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "UPDATE `xuser` SET `BANNED` = b'" + status + "' WHERE `USER_NAME` = " + connection.escape(username);

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                if(rows.length < 1){
                    return F.responseJson(res, "User not found.", null, STATUS.NOT_FOUND);
                }
                var type ;
                if(status == 0){
                    type = "active";
                } else {
                    type = "banned";
                }
                F.logger(connection, req, "Change status " + username + " to " + type);

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
    };

    //user log
    self.getUserLog = function(req, res, next){
        var userID = (req.params.userID === null ) ? null : req.params.userID;

        if(userID === null){
            return F.responseJson(res, "Password is required.", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connect){
            if(err)
                return F.responseJson(res, err, {});

            var query = "SELECT hu.created_date, hu.result, hu.money, hd.log_content, x.SHORT_NAME FROM `history_game_room_user` AS hu INNER JOIN `history_game_room_detail` as hd ON hu.history_game_room_detail_id = hd.id INNER JOIN `history_game_room` AS hr ON hd.history_game_room_id= hr.id INNER JOIN `xgame_type` AS x ON hr.xgame_type_id=x.ID WHERE hu.xuser_id=" + connect.escape(userID) + "ORDER BY hu.created_date DESC LIMIT 500";

            connect.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                rows.forEach(function(row, index){
                    var regEx = /([a-zA-Z_]){1}(\w{4,}(?!\{un\:))/ig;
                    var names = row.log_content.split("start:")[1].split(";")[0].match(regEx);
                    delete row.log_content;
                    row.usersPlayed = names.join(", ");
                });

                return F.responseJson(res, null , rows, STATUS.OK);
            });
        });
    };

    self.putUserCoin = function(req, res, next){
        var username = (req.params.username === null)? null : req.params.username;
        var coin = (req.body.coin === null) ? null : req.body.coin;
        coin = parseInt(coin);

        if(username == null){
            return F.responseJson(res, "Username is not empty.", {}, STATUS.BAD_REQUEST);
        }

        if(isNaN(coin) || coin < 0){
            return F.responseJson(res, "Coin number is not valid", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "UPDATE `xuser` SET `xcoin` = " + connection.escape(coin) + " WHERE `USER_NAME` = " + connection.escape(username);

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                if(rows.length < 1){
                    return F.responseJson(res, "User not found.", null, STATUS.NOT_FOUND);
                }

                //log
                F.logger(connection, req, "Add coin to user " + username + " : " + coin);

                return F.responseJson(res, null , rows, STATUS.OK);
            });
        });
    };

    /* *
     * ============================== ADMIN USER =========================================
     * */

    self.getAllAdmins = function(req, res, next){
        var username = jwt.verify(req.token, process.env.JWT_SECRET).email;
        req.getConnection(function(err, connect){
            var query = "SELECT * FROM `xadmin` INNER JOIN `admin_roles` ON `xadmin`.`role_id` = `admin_roles`.`id` WHERE `xadmin`.`username` !="+connect.escape(username) ;
            //console.log(query);
            connect.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null , rows, STATUS.OK);
            });
        });
    };

    self.getAdmin = function(req, res, next){
        var adminUser = (req.params.adminUser === null ) ? null : req.params.adminUser;

        req.getConnection(function(err, connect){
            var query = "SELECT * FROM `xadmin` INNER JOIN `admin_roles` ON `xadmin`.`role_id` = `admin_roles`.`id` WHERE `xadmin`.`username` ="+connect.escape(adminUser) ;
            //console.log(query);
            connect.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null , rows, STATUS.OK);
            });
        });
    };

    self.postResetPassAdmin = function(req, res, next){
        var adminUser = (req.params.adminUser === null ) ? null : req.params.adminUser;
        var nPassword = (req.body.nPassword === null ) ? null : req.body.nPassword;

        if( nPassword === null){
            return F.responseJson(res, "admin password is required" , null, STATUS.OK);
        }

        var code = jwt.sign({
            email : adminUser,
            password : nPassword
        }, process.env.JWT_SECRET);

        var password = bcrypt.hashSync(nPassword);

        req.getConnection(function(err, connect){
            var query = "UPDATE `xadmin` SET `password` = \"" + password + "\", `verificationToken` = \"" + code + "\" WHERE `username`= " + connect.escape(adminUser);
            console.log(query);
            connect.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                F.logger(connect, req, "Change admin password  : " + adminUser);

                return F.responseJson(res, null , rows, STATUS.OK);
            });
        });
    };

    self.putChangePermission = function(req, res, next){
        var adminUser = (req.params.adminUser === null ) ? null : req.params.adminUser;
        var role_id = (req.body.role_id === null ) ? null : req.body.role_id;

        if(role_id == null){
            return F.responseJson(res, "role ID is required", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connect){
            var query = "UPDATE `xadmin` SET `role_id`= " + connect.escape(role_id) + " WHERE `username`= " + connect.escape(adminUser);
            console.log(query);
            connect.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                F.logger(connect, req, "Change admin permission : " + adminUser);

                return F.responseJson(res, null , rows, STATUS.OK);
            });
        });
    };

    self.postAddAdminUser = function(req, res, next){
        var username = (req.body.username == null) ? null : req.body.username;
        var password = (req.body.password == null) ? null : req.body.password;
        var role = (req.body.role_id == null) ? null : req.body.role_id;

        if(username == null){
            return F.responseJson(res, "Admin username is required", {}, STATUS.BAD_REQUEST);
        }
        if(password == null){
            return F.responseJson(res, "Admin Password is required", {}, STATUS.BAD_REQUEST);
        }

        password = bcrypt.hashSync(password);
        var token = jwt.sign({
            email : username,
            password : password
        }, process.env.JWT_SECRET);

        req.getConnection(function(err, connect){
            var query = "INSERT INTO `xadmin`(`id`, `username`, `password`, `role_id`, `verificationToken`)  VALUES(NULL, " + connect.escape(username) + ", "
                + connect.escape(password) + ", " + connect.escape(role) + ", " + connect.escape(token) + ")";
            //console.log(query);

            connect.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                F.logger(connect, req, "Add new Admin : " + username);

                return F.responseJson(res, null , rows, STATUS.OK);
            });
        });
    };

    self.deleteAdminUser = function(req, res, next){
        var username = req.params.adminUser;

        req.getConnection(function(err, connect){
            if(err)
                return F.responseJson(res, err, {});

            var query = "DELETE FROM `xadmin` WHERE `username`= " + connect.escape(username);

            //console.log(query);
            connect.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                F.logger(connect, req, "Delete Admin : " + username);

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };


    //admin log
    self.getAdminLog = function(req, res, next){
        req.getConnection(function(err, connect){
            if(err)
                return F.responseJson(res, err, {});

            var query = "SELECT * FROM `user_log` ORDER BY time DESC";

            connect.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    }
};

module.exports = user;