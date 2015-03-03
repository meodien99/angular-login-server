var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus');
var moment = require('moment-timezone');

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
        //update later
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

            var query = "INSERT INTO `apps` (`id`, `name`, `image`, `description`, `eDate`, `sDate`, `platform`, `offerid`, `coins`) VALUES (NULL, \'"+ name +"\', NULL, \'"+ description +"\', \'"+ eDate +"\', \'"+ sDate +"\', \'"
                + platform + "\', \'" + offerID + "\', \'" + coins + "\')";

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

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


            if(name == null || description == null || eDate == null ||  sDate == null || offerID == null || platform == null || coins == null  )
                return F.responseJson(res, "Field not empty", {}, STATUS.BAD_REQUEST);

            var query = "UPDATE `apps` SET `name`=\'"+ name +"\', `description`=\'"+ description +"\', `eDate`=\'"+ eDate +"\', `sDate`=\'"+ sDate +"\', `offerID`=\'" + offerID + "\', `platform`=\'"
                + platform +"\', `coins`=\'" + coins + "\' WHERE `id`=\'"+ req.params.id +"\'";


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