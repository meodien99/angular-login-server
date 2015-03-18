var express = require('express');

var server = function(app){
    var path = require('path');
    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var methodOverride = require('method-override');
    var session = require('express-session');
    var cors = require('cors');
    var bcrypt = require('bcrypt-nodejs');
    var multer = require('multer');
    var multer_path = require('../configs/multer_path');

    process.env['JWT_SECRET'] = 'JWTSECRETKEY';





    //form-multipart
    app.use(multer(multer_path.pci));

    // view engine setup
    app.set('views', path.join(__dirname, '../../views'));
    app.set('view engine', 'ejs');

    // uncomment after placing your favicon in /public
    //app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, '../../public')));
    app.use('/public', express.static(path.join(__dirname, '../../public')));

    app.use(methodOverride(function(req, res){
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    //session
    app.use(session({secret:'ssssssssss', resave : true, saveUninitialized: true}));

    //cors
    app.use(cors());


};

module.exports = server;