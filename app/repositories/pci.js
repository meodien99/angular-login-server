var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus');
var moment = require('moment-timezone');
var image = require('easyimage');
var http = require('http');

function fnAppend(fn, insert) {
    var arr = fn.split('.');
    var ext = arr.pop();
    insert = (insert !== undefined) ? insert : new Date().getTime();
    return arr + '.' + insert + '.' + ext;
}


var PCI = function(){
    "use strict";

    var self = this;

    self.getAppUserCanInstall = function(req, res, next){
        var platform = (req.query.platform) ? req.query.platform : null,
            deviceID = (req.query.deviceID) ? req.query.deviceID : null,
            user = (req.query.user) ? req.query.user : null;

        if(platform === null){
            return F.responseJson(res, "PlatForm is empty", {}, STATUS.BAD_REQUEST);
        }

        if(deviceID === null || user === null){
            return F.responseJson(res, "User or device is empty", {}, STATUS.BAD_REQUEST);
        }
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var appsQuery = "SELECT * FROM apps WHERE eDate >= CURDATE() AND platform =\"" + platform + "\"";
            connection.query(appsQuery, function(err, apps){
                if(err)
                    return F.responseJson(res, err, {});

                //query get record that installed by user
                var recordQuery = "SELECT offerid FROM record WHERE user=\"" + user + "\" AND deviceID=\"" + deviceID + "\" AND platform=\"" + platform + "\"";
                connection.query(recordQuery, function(err, records){
                    if(err)
                        return F.responseJson(res, err, {});

                    for(var i in apps){
                        console.log({offerid : apps[i].offerID});
                        for(var j = 0; j < records.length; j++){
                            if(apps[i].offerID === records[i].offerid){
                                apps.splice(i,1);
                                break;
                            }
                        }
                    }

                    return F.responseJson(res, null, apps, STATUS.OK);
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
                connection.query(findApp, function(err, apps, fields){
                    if(err){
                        connection.rollback(function(){
                            throw err;
                        })
                    }

                    console.log(fields);

                    //check if user online
                    var userQuery = "SELECT id,is_online,username from `xuser` WHERE `username`=\'" + user +"\' AND `is_ai`=(0) LIMIT 1";
                    console.log(apps);
                    return connection.query(userQuery, function(err, users){
                        if(err){
                            connection.rollback(function(){
                                throw err;
                            });
                        }
                        console.log(users);
                        //insert to record
                        var saveToRecord = "INSERT INTO `record`(`id`,`offerid`,`transactionID`,`platform`,`user`,`deviceID`) VALUES(NULL,\'" + offerid +"\'," +
                            transactionID + ", \'" + platform + "\', \'" + user + "\', \'" + deviceID + "\')";

                        connection.query(saveToRecord, function(err, record){
                            if(err){
                                connection.rollback(function(){
                                    throw err;
                                });
                            }
                        });


                        //insert to activity
                        var message = "You have added " + apps[0].coins;
                        var saveToActivity = "INSERT INTO `xuser_activity_message`(`id`,`xuser_id`,`content`,`created_date`,`new_activity`) VALUES(NULL,\'" + user[0].id +"\'," +
                            transactionID + ", \'" + message + "\', \'" + new Date().toISOString().slice(0, 19).replace('T', ' ') + "\', (" + users[0].IS_ONLINE[0] + "))";

                        return connection.query(saveToActivity, function(err, activity){
                            if(err){
                                connection.rollback(function(){
                                    throw err;
                                });
                            }

                            var mid = activity.insertId;

                            //call to SmartFox API
                            var post_data = querystring.stringify({
                                'username' : user,
                                'balance' : balance,
                                'message' : message,
                                'mid' : mid
                            });
                            var post_option = {
                                host :  "http://52.10.41.39",
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
                                res.setEncoding('utf8');
                                res.on('data', function (chunk) {
                                    console.log('Response: ' + chunk);
                                });
                            });

                            // post the data
                            post_req.write(post_data);
                            post_req.end();


                            return connection.commit(function(err) {
                                if (err) {
                                    connection.rollback(function() {
                                        throw err;
                                    });
                                }
                                return F.responseJson(res, err, {});
                            });
                        });
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

            if(name == null || description == null || eDate == null ||  sDate == null || offerID == null || platform == null || coins == null  )
                return F.responseJson(res, "Field not empty", {}, STATUS.BAD_REQUEST);

            var file = req.files.icon;
            if(file == null){
                return F.responseJson(res, "Icon Image is required !", {}, STATUS.BAD_REQUEST);
            }

            var type = file.mimetype;
            if(type !== 'image/png' && type !== 'image/jpeg' && type !== 'image/gif' && type !== 'image/jpg'){
                return F.responseJson(res, "Icon must be image type !", {}, STATUS.BAD_REQUEST);
            }

            image.resize({
                src : file.path,
                dst : fnAppend(file.path,'thumb'),
                width : 100,
                height : 100
            }, function(err ,image, error){
                if(err)
                    return F.responseJson(res, err, {});
                var icon = '/public/uploades/' + fnAppend(file.name, 'thumb');
                var query = "INSERT INTO `apps` (`id`, `name`, `icon`, `description`, `eDate`, `sDate`, `platform`, `offerid`, `coins`) VALUES (NULL, \'"+ name +"\', \'" + icon + "\', \'"+ description +"\', \'"+ eDate +"\', \'"+ sDate +"\', \'"
                    + platform + "\', \'" + offerID + "\', \'" + coins + "\')";

                connection.query(query, function(err, rows){
                    if(err)
                        return F.responseJson(res, err, {});

                    return F.responseJson(res, null, rows, STATUS.CREATED);
                });
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


            if(name == null || description == null || eDate == null ||  sDate == null || offerID == null || platform == null || coins == null  )
                return F.responseJson(res, "Field not empty", {}, STATUS.BAD_REQUEST);

            var query = "UPDATE `apps` SET `name`=\'"+ name +"\', `description`=\'"+ description +"\', `eDate`=\'"+ eDate +"\', `sDate`=\'"+ sDate +"\', `offerID`=\'" + offerID + "\', `platform`=\'"
                + platform +"\', `coins`=\'" + coins + "\'";

            var file = req.files.icon;
            if(file){

                var type = file.mimetype;
                if(type !== 'image/png' && type !== 'image/jpeg' && type !== 'image/gif' && type !== 'image/jpg'){
                    return F.responseJson(res, "Icon must be image type !", {}, STATUS.BAD_REQUEST);
                }
                image.resize({
                    src : file.path,
                    dst : fnAppend(file.path,'thumb'),
                    width : 100,
                    height : 100
                }, function(err ,image, error){
                    if(err)
                        return F.responseJson(res, err, {});
                });
                var icon = '/public/uploades/' + fnAppend(file.name, 'thumb');
                query += ", `icon`=\'" + icon + "\' WHERE `id`=\'"+ req.params.id +"\'";
            } else {
                console.log(2);

                query += " WHERE `id`=\'"+ req.params.id +"\'";
            }

            console.log(query);
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

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

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };
};

module.exports = PCI;