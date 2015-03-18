process.env['db_default'] = 'playa';
process.env['run_cronjob'] = 'true';

var express = require('express');
var app = express();
var CronJob = require('cron').CronJob;
var yargs = require('yargs').argv;

var Record = require('./app/helpers/CCU-record');

var job = new CronJob({
    cronTime : '0 */10 * * * *',
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

var __cronJob = null;
if(typeof yargs.c !== "undefined"){
    __cronJob = yargs.c
} else {
    __cronJob = process.env.run_cronjob;
}
//
if(__cronJob == 'true'){
    console.log('cron job is running ...');
    job.start();
}
require('./app/helpers/commands')(app);
require('./app/setups/server')(app);
require('./app/setups/routers')(app);

module.exports = app;
