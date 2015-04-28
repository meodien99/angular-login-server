var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus');

var payment = function(){
    "use strict";

    var self = this;

    self.getCardByTime = function(req, res){
        var from = (req.query.from === null) ? null : req.query.from.replace('"','').replace('T',' ').slice(0,19);
        var to = (req.query.to === null) ? null : req.query.to.replace('"','').replace('T',' ').slice(0,19);

        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            //var query = "SELECT `xuser`.`USER_NAME`  FROM `xcharge_history` INNER JOIN xuser ON xuser.`ID` = `xcharge_history`.`XUSER_ID` INNER JOIN `xcard_user_charge` ON `xcharge_history`.`XCARD_CHARGE_ID`=`xcard_user_charge`.`ID` WHERE (xcharge_history.DATE_TIME BETWEEN \""+ from +"\" AND \""+ to +"\") AND `xcharge_history`.`XCARD_CHARGE_ID` >0;";
            var query = "SELECT `xuser`.`USER_NAME`, `xuser`.`current_xclient_type`, `xcharge_history`.`DATE_TIME`, `xcharge_history`.`MONEY`, `xcharge_history`.`BALANCE`,  `xcard_user_charge`.`SERIAL`, `xcard_user_charge`.`CODE`, `xcard_user_charge`.`TELCO_ID` FROM `xcharge_history` INNER JOIN xuser ON xuser.`ID` = `xcharge_history`.`XUSER_ID` INNER JOIN `xcard_user_charge` ON `xcharge_history`.`XCARD_CHARGE_ID`=`xcard_user_charge`.`ID` WHERE (xcharge_history.DATE_TIME BETWEEN "+ connection.escape(from) +" AND "+ connection.escape(to) +") AND `xcharge_history`.`XCARD_CHARGE_ID` >0 ORDER BY `xcharge_history`.`DATE_TIME` DESC;;";

            console.log(query);
            connection.query(query, function(err, tasks){
                if(err){
                    console.log("ERROR: get card by time " + err)
                    return F.responseJson(res, err, {});
                }
                return F.responseJson(res, null, tasks, STATUS.OK);
            });
        });
    };
    self.getSmsByTime = function(req, res){
        var from = (req.query.from === null) ? null : req.query.from.replace('"','').replace('T',' ').slice(0,19);
        var to = (req.query.to === null) ? null : req.query.to.replace('"','').replace('T',' ').slice(0,19);
        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            //var query = "SELECT xcard_user_charge.SERIAL, xcard_user_charge.CODE, xcard_user_charge.CHARGE_TIME, xuser.USER_NAME, xtelco.NAME, xcard_user_charge.error FROM xcard_user_charge INNER JOIN xuser ON xcard_user_charge.XUSER_ID = xuser.ID INNER JOIN xtelco ON xcard_user_charge.TELCO_ID = xtelco.ID WHERE (xcard_user_charge.ID > 13300";
            var query = "SELECT * FROM xsms_user_charge_raw WHERE (xsms_user_charge_raw.created_datetime BETWEEN "+ connection.escape(from) +" AND "+ connection.escape(to) +")";

            connection.query(query, function(err, tasks){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, tasks, STATUS.OK);
            });
        });
    };
    self.getBankTransferByTime = function(req, res){
        var from = (req.query.from === null) ? null : req.query.from.replace('"','').replace('T',' ').slice(0,19);
        var to = (req.query.to === null) ? null : req.query.to.replace('"','').replace('T',' ').slice(0,19);
        if(from == null || to == null){
            return F.responseJson(res, "Start date or End date must be filled.", {}, STATUS.BAD_REQUEST);
        }
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            //var query = "SELECT u1.`USER_NAME` AS name1, u2.`USER_NAME` AS name2 , `xb`.`reason`,  `xb`.`xcoin`, `xb`.`transfer_time` FROM xbank_transfer xb INNER JOIN `xuser` u1 ON xb.xuser_id = u1.id INNER JOIN `xuser` u2 ON xb.to_xuser_id = u2.id WHERE  (xb.transfer_time BETWEEN "+ connection.escape(from) +" AND "+ connection.escape(to) +") ORDER BY `xb`.`transfer_time` DESC;";
            var query = "SELECT u1.`USER_NAME` AS name1, u2.`USER_NAME` AS name2 , `xb`.`reason`, `xb`.`transfer_time` FROM xbank_transfer xb INNER JOIN `xuser` u1 ON xb.xuser_id = u1.id INNER JOIN `xuser` u2 ON xb.to_xuser_id = u2.id WHERE  (xb.transfer_time BETWEEN "+ connection.escape(from) +" AND "+ connection.escape(to) +") ORDER BY `xb`.`transfer_time` DESC;";

            connection.query(query, function(err, tasks){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, tasks, STATUS.OK);
            });
        });
    };
};

module.exports = payment;