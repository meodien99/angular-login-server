var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus');
var moment = require('moment-timezone');

var PCI = function(){
    "use strict";

    var self = this;

    self.getOffers = function(req, res, next){
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
};

module.exports = PCI;