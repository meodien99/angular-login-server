var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus');
var moment = require('moment-timezone');
var querystring = require('query-string');
var image = require('easyimage');
var http = require('http');

var PCI = function(){
    "use strict";

    var self = this;

    self.getAppUserCanInstall = function(req, res, next){
        var platform = (req.query.platform) ? req.query.platform : null,
            deviceID = (req.query.deviceID) ? req.query.deviceID : null,
            user = (req.query.user) ? req.query.user : null,
            type = (req.query.type) ? req.query.type : null;
        var affID = 2;

        if(platform === null){
            return F.responseJson(res, "PlatForm is empty", {}, STATUS.BAD_REQUEST);
        }

        if(deviceID === null || user === null){
            return F.responseJson(res, "User or device is empty", {}, STATUS.BAD_REQUEST);
        }

        if(type === null ){
            return F.responseJson(res, "Type is empty", {}, STATUS.BAD_REQUEST);
        } else if (type !== "coins" && type !== "gems"){
            return F.responseJson(res, "Type data is invalid", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var appsQuery = "SELECT * FROM apps WHERE eDate >= CURDATE() AND platform =\"" + platform + "\" AND " + type + " > 0;";
            console.log(appsQuery)
            connection.query(appsQuery, function(err, apps){
                if(err)
                    return F.responseJson(res, err, {});

                //query get record that installed by user
                var recordQuery = "SELECT offerid FROM record WHERE user=\"" + user + "\" AND deviceID=\"" + deviceID + "\" AND platform=\"" + platform + "\"";
                connection.query(recordQuery, function(err, records){
                    if(err)
                        return F.responseJson(res, err, {});
                    var r = [];
                    for(var i in records){
                        r.push(records[i].offerid);
                    }
                    var a = [];
                    for(var i = 0; i< apps.length; i ++){
                        if(!F.inArray(apps[i].offerID, r)){
                            a.push(apps[i]);
                        }

                    }
                    for(var i in a ){
                        a[i]["trackingURL"] = "http://tracking.leadsgen.asia/aff_c?offer_id="+ a[i].offerID +
                        "&aff_id=" + affID + "&platform=" + a[i].platform + "&user=" + user + "&deviceId=" + deviceID;
                    }

                    return F.responseJson(res, null, a, STATUS.OK);
                });
            });
        });
    };

    //notified when success
    self.getSaveToRecord = function(req, res, next){
        var offerid = (req.query.offerID) ? req.query.offerID : null;
        var transactionID = (req.query.transactionID) ? req.query.transactionID : null;
        var platform = (req.query.platform) ? req.query.platform : null;
        var user = (req.query.user) ? req.query.user : null;
        var deviceID = (req.query.deviceID) ? req.query.deviceID : null;


        if(offerid == null || transactionID == null){
            return F.responseJson(res, "offer or transaction are required", {}, STATUS.BAD_REQUEST);
        }
        if(platform === null){
            return F.responseJson(res, "PlatForm is empty", {}, STATUS.BAD_REQUEST);
        }

        if(deviceID === null || user === null){
            return F.responseJson(res, "User or device are required", {}, STATUS.BAD_REQUEST);
        }

        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            connection.beginTransaction(function(err){
                if(err)
                    throw err;
                //find apps depend on offerID
                var findApp = "SELECT * FROM `apps` WHERE offerID= \'"+ offerid +"\' AND platform=\'" + platform + "\' LIMIT 1";
                //console.log(findApp);
                connection.query(findApp, function(err, apps, fields){
                    if(err){
                        connection.rollback(function(){
                            return F.responseJson(res, err, {});
                        })
                    }

                    if(apps.length < 1) {
                        return F.responseJson(res, "Not found App contains offerId : " + offerid +" and platform : "+ platform);
                    }
                    //console.log(fields);

                    //check if user online
                    var userQuery = "SELECT ID,IS_ONLINE,USER_NAME from `xuser` WHERE `USER_NAME`=\'" + user +"\' AND `is_ai`=(0) LIMIT 1";
                    console.log(userQuery);

                    return connection.query({
                        sql : userQuery
                    }, function(err, users){
                        if(err){
                            connection.rollback(function(){
                                return F.responseJson(res, err, {});
                            });
                        }
                        if(users.length < 1) {
                            connection.rollback(function(){
                                return F.responseJson(res, "User not found ", {}, STATUS.NOT_FOUND);
                            });
                        } else {
                            //check if this user is already paid this app
                            var checkUserAlreadyPaidQuery = "SELECT * FROM `record` WHERE `user`="+ connection.escape(users[0].USER_NAME) + " AND `deviceID`="
                                + connection.escape(deviceID) + " AND `transactionID`= " + connection.escape(transactionID) + " AND `offerid`=" + connection.escape(offerid)
                                + " AND platform=" + connection.escape(platform);
                            console.log(checkUserAlreadyPaidQuery);

                            connection.query(checkUserAlreadyPaidQuery, function(err, checked){
                                if(err)
                                    connection.rollback(function(){
                                        return F.responseJson(res, err, {});
                                    });

                                if(checked.length > 0){
                                    connection.rollback(function(){
                                        console.log(123);
                                        return F.responseJson(res, "Record already written", {});
                                    });
                                } else {
                                    //insert to record
                                    var saveToRecordQuery = "INSERT INTO `record`(`id`,`offerid`,`transactionID`,`platform`,`user`,`deviceID`) VALUES(NULL,\'" + offerid +"\', \'" +
                                        transactionID + "\', \'" + platform + "\', \'" + user + "\', \'" + deviceID + "\')";

                                    connection.query(saveToRecordQuery, function(err, record){
                                        if(err){
                                            connection.rollback(function(){
                                                return F.responseJson(res, err, {});
                                            });
                                        }
                                    });

                                    //insert to activity
                                    var message = "You have added ";
                                    if(apps[0].coins > 0) {
                                        var coins = apps[0].coins;
                                        message += " " + coins +" coins";
                                    }
                                    if(apps[0].gems > 0) {
                                        var gems = apps[0].gems
                                        message += " " + gems +" gems";
                                    }
                                    console.log(message);

                                    var activity = 1;
                                    if(users[0].IS_ONLINE[0] == '1'){
                                        activity = 0;
                                    }
                                    var saveToActivity = "INSERT INTO `xuser_activity_message`(`id`,`xuser_id`,`content`,`created_date`,`new_activity`) VALUES(NULL,\'" + users[0].ID +"\', \'"
                                        + message + "\', \'" + new Date().toISOString().slice(0, 19).replace('T', ' ') + "\', (" + activity + "))";
                                    return connection.query(saveToActivity, function(err, activity){
                                        if(err){
                                            connection.rollback(function(){
                                                return F.responseJson(res, err, {});
                                            });
                                        }
                                        var mid = activity.insertId;

                                        //call to SmartFox API
                                        var post_data = querystring.stringify({
                                            'username' : user,
                                            'balance' : apps[0].coins,
                                            'message' : message,
                                            'mid' : mid,
                                            'gold' : apps[0].gems
                                        });

                                        console.log(post_data);
                                        var post_option = {
                                            host :  "52.10.41.39",
                                            port : 3768,
                                            path : "/service/cpi/notify",
                                            method : "POST",
                                            headers : {
                                                'Content-Type': 'application/x-www-form-urlencoded',
                                                'Content-Length': post_data.length
                                            }
                                        };

                                        //setup request
                                        var post_req = http.request(post_option, function(res){
                                            console.log('STATUS: ' + res.statusCode);
                                            console.log('HEADERS: ' + JSON.stringify(res.headers));
                                            res.setEncoding('utf8');
                                            res.on('data', function (chunk) {
                                                console.log('BODY: ' + chunk);
                                            });
                                        });

                                        post_req.on('error', function(e){
                                            console.log("err : " + e.message);
                                        });
                                        // post the data
                                        post_req.write(post_data);
                                        post_req.end();


                                        return connection.commit(function(err) {
                                            if (err) {
                                                connection.rollback(function() {
                                                    return F.responseJson(res, err, {});
                                                });
                                            }
                                            return F.responseJson(res, null, {result : "OK"}, STATUS.OK);
                                        });
                                    });
                                }
                            });
                        }
                    });
                });
            });
        });
    };

    //all
    self.getAllApps = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "SELECT * FROM apps ";

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    //one
    self.getPCIAppDetail = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = "SELECT * FROM apps WHERE id=" + req.params.id;

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    //create
    self.postCreateApps = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var name = (req.body.name == null) ? null : req.body.name;
            var description = (req.body.description == null) ? null : req.body.description;
            var eDate = (req.body.eDate == null) ? null : req.body.eDate;
            var sDate = (req.body.sDate == null) ? null : req.body.sDate;
            var offerID = (req.body.offerID == null) ? null : req.body.offerID;
            var platform = (req.body.platform == null) ? null : req.body.platform;
            var coins = (req.body.coins == null) ? null : req.body.coins;
            var gems = (req.body.gems == null ) ? null : req.body.gems;

            //console.log(eDate);
            if(name == null || description == null || eDate == null ||  sDate == null || offerID == null || platform == null || coins == null || gems == null )
                return F.responseJson(res, "Field not empty", {}, STATUS.BAD_REQUEST);

            var file = req.files.file;
            //console.log(file);
            if(file == null){
                return F.responseJson(res, "Icon Image is required !", {}, STATUS.BAD_REQUEST);
            }

            var type = file.mimetype;
            if(type !== 'image/png' && type !== 'image/jpeg' && type !== 'image/gif' && type !== 'image/jpg'){
                return F.responseJson(res, "Icon must be image type !", {}, STATUS.BAD_REQUEST);
            }

            image.resize({
                src : file.path,
                dst : F.fnAppend(file.path,'thumb'),
                width : 100,
                height : 100
            }, function(err ,image, error){
                if(err)
                    return F.responseJson(res, err, {});
            });

            var icon = '/public/uploads/' + F.fnAppend(file.name, 'thumb');
            var query = "INSERT INTO `apps` (`id`, `name`, `icon`, `description`, `eDate`, `sDate`, `platform`, `offerid`, `coins`, `gems`) VALUES (NULL, \'"+ name +"\', \'" + icon + "\', \'"+ description +"\', \'"+ eDate +"\', \'"+ sDate +"\', \'"
                + platform + "\', \'" + offerID + "\', \'" + coins + "\'," + connection.escape(gems) + ")";

            //console.log(query);
            return connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                F.logger(connection, req, "Create new app");

                return F.responseJson(res, null, rows, STATUS.CREATED);
            });
        });
    };

    //update
    self.putUpdateApp = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var name = (req.body.name == null) ? null : req.body.name;
            var description = (req.body.description == null) ? null : req.body.description;
            var eDate = (req.body.eDate == null) ? null : req.body.eDate;
            var sDate = (req.body.sDate == null) ? null : req.body.sDate;
            var offerID = (req.body.offerID == null) ? null : req.body.offerID;
            var platform = (req.body.platform == null) ? null : req.body.platform;
            var coins = (req.body.coins == null) ? null : req.body.coins;
            var gems = (req.body.gems == null) ? null : req.body.gems;

            //console.log(eDate);
            if(name == null || description == null || eDate == null ||  sDate == null || offerID == null || platform == null || coins == null || gems == null )
                return F.responseJson(res, "Field not empty", {}, STATUS.BAD_REQUEST);

            var query = "UPDATE `apps` SET `name`=\'"+ name +"\', `description`=\'"+ description +"\', `eDate`=\'"+ eDate +"\', `sDate`=\'"+ sDate +"\', `offerID`=\'" + offerID + "\', `platform`=\'"
                + platform +"\', `coins`=\'" + coins + "\', `gems`=" + connection.escape(gems);

            var file = req.files.file;
            if(file){
                //console.log(1);
                var type = file.mimetype;
                if(type !== 'image/png' && type !== 'image/jpeg' && type !== 'image/gif' && type !== 'image/jpg'){
                    return F.responseJson(res, "Icon must be image type !", {}, STATUS.BAD_REQUEST);
                }
                image.resize({
                    src : file.path,
                    dst : F.fnAppend(file.path,'thumb'),
                    width : 100,
                    height : 100
                }, function(err ,image, error){
                    if(err)
                        return F.responseJson(res, err, {});
                });
                var icon = '/public/uploads/' + F.fnAppend(file.name, 'thumb');
                query += ", `icon`=\'" + icon + "\' WHERE `id`=\'"+ req.params.id +"\'";
            } else {
                //console.log(2);

                query += " WHERE `id`=\'"+ req.params.id +"\'";
            }

            //console.log(query);
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});
                F.logger(connection, req, "Update App Id : " + req.params.id);

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    //delete
    self.deleteApp = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var id = req.params.id;
            var query = "DELETE FROM `apps` WHERE `id`="+id;

            console.log(req.token);
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                F.logger(connection, req, "Delete App PCI :" + id);

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };
};

module.exports = PCI;