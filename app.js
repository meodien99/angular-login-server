var express = require('express');
var app = express();
var CronJob = require('cron').CronJob;
var yargs = require('yargs').boolean('c').argv;

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
if(yargs.c){
    console.log('cron job is running ...');
    job.start();
}
require('./app/helpers/commands')(app);
require('./app/setups/server')(app);
require('./app/setups/routers')(app);

module.exports = app;
