var CronJob = require('cron').CronJob,
    mysql = require('mysql'),
    dbConfig = require('../configs/database');
var moment = require('moment-timezone'),
    timezone = require('../configs/moment_time_zone').timezone;
var yargs = require('yargs').argv;

var __dbConfig = null;
if(yargs.db && dbConfig[yargs.db]){
    __dbConfig = yargs.db
} else {
    __dbConfig = "local";
}

var connection  = mysql.createConnection(dbConfig[__dbConfig].mysql);

var Record = function(){
    "use strict";
    var self = this;

    self.write = function(){
        var selectCCU = "SELECT id,USER_NAME,IS_ONLINE,last_login_time,current_xclient_type,REGISTERED_DATE FROM xuser WHERE is_online=(1) and is_ai=(0)";
        connection.query(selectCCU, function(err, rows, fields){
            if(err)
                throw err;

            var androidCCU = 0;
            var iosCCU = 0;
            var j2meCCU = 0;
            var winPhoneCCU = 0;
            var Web = 0;

            //console.log(rows);
            for(var i  in rows){
                var current_type_client = rows[i].current_xclient_type;
                if(current_type_client != null) {
                    var platform = current_type_client.split(":")[0];

                    if (platform === ("Android")) {
                        androidCCU++;
                    } else if (platform === ("IOS version")) {
                        iosCCU++;
                    } else if (platform === ("J2ME")) {
                        j2meCCU++;
                    } else if (platform === ("WINDOWS PHONE")) {
                        winPhoneCCU++;
                    } else {
                        Web++;
                    }
                }
            }

            //
            var data = {
                Android : androidCCU,
                IOS : iosCCU,
                J2ME : j2meCCU,
                WINDOWS_PHONE : winPhoneCCU,
                WEB : Web,
                Total : rows.length
            };
            var time = moment().tz(timezone).format().slice(0, 19).replace('T', ' ');
            var query = "INSERT INTO ccu_log(`id`,`platform`,`date`,`ccu`) VALUES ";

            for(var i in data ){
                var pn = i;
                if(i === "WINDOWS_PHONE")
                    pn = "WINDOWS PHONE";
                else if (i === "IOS")
                    pn = "IOS version";

                query += "(null,\"" + pn + "\",\"" + time + "\"," + data[i] + "),";

            }
            query  = query.substring(0, query.length - 1);

            //console.log(query);
            //self.end();
            connection.query(query, function(err, ccus){
                if(err)
                    throw err;

                console.log("DONE !!");
            })
        });
    };

    self.connect = function(){
      connection.connect(function(err){
          if(err)
            console.log("CRON DB CONNECT ERROR ! REASON : " + err);
      });

        return self;
    };

    self.end = function(){
        connection.end();
        return self;
    }
};


module.exports = Record;