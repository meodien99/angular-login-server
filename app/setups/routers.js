var express = require('express');
var app = express();

var routers = function(app){
    "use strict";

    var statistic = require('../controllers/statistic'),
        users = require('../controllers/user'),
        payment = require('../controllers/payment'),
        event = require('../controllers/event'),
        authen = require('../controllers/authen'),
        messages = require('../controllers/message'),
        pci = require('../controllers/pci'),
        xinvite = require('../controllers/xinvite_event');
   /* app.get('/yolo', IsAuthenticated, function(req, res, next){
        console.log(req.user);
        res.json({ok:200});
    });*/
    function ensureAuthorized (req, res, next){
        var bearerToken ;
        var bearerHeader = req.headers["authorization"];
        if(typeof bearerHeader !== 'undefined'){
            var bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];
            //console.log(bearerToken);
            req.ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            req.token = bearerToken;
            next();
        } else {
            res.sendStatus(401);
        }
    }

    //# api/app/*
    app.use('/', pci);
    //# /login
    app.use('/', authen);
    //# /events/xinvite
    app.use('/events', xinvite);
    //# /users
    app.use('/users',ensureAuthorized , users);
    //# /*statistic
    app.use('/', ensureAuthorized, statistic);
    //# /message/*
    app.use('/', ensureAuthorized, messages);
    app.use('/payment', ensureAuthorized, payment);
    app.use('/event', ensureAuthorized, event);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            var status = err.status || 500;
            res.status(status);
            /* res.render('error', {
             message: err.message,
             error: {}
             });*/
            res.json({
                code : status,
                message : err.message
            })
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        var status = err.status || 500;
        res.status(status);
       /* res.render('error', {
            message: err.message,
            error: {}
        });*/
        res.json({
            code : status,
            message : err.message
        })
    });


};

module.exports = routers;