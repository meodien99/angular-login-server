var express = require('express');
var app = express();
var CronJob = require('cron').CronJob;

var Record = require('./app/helpers/CCU-record');

var job = new CronJob({
    cronTime : '* */6 * * * *',
    onTick : function(){
        "use strict";
        var recode = new Record();
         recode.write();
    },
    onComplete : function(){
        "use strict";
        console.log("Stop");
    },
    start: false,
    timeZone : 'Asia/Saigon'
});
//job.start();
require('./app/setups/server')(app);
require('./app/setups/routers')(app);

module.exports = app;
