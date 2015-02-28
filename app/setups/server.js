var express = require('express');
var app = express();

var server = function(app){
    var path = require('path');
    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var methodOverride = require('method-override');
    var session = require('express-session');
    var cors = require('cors');
    var mysql = require('mysql');
    var mysqlConfig = require('../configs/database').mysql;
    var connection = require('express-myconnection');
    var bcrypt = require('bcrypt-nodejs');
    var jwt = require('jsonwebtoken');

    process.env['JWT_SECRET'] = 'JWTSECRETKEY';

    //setup mysql driven
    app.use(
        connection(mysql, mysqlConfig,'request')
    );
   /* app.use(function(req, res, next){
        req.getConnection(function(err, connection){
            if(err){
                console.log("E : " + err);
            }

            connection.query('select * from xadmin where firstname=\'Asdmin\' limit 1', function(err, rows){
                if(err){
                    console.log("E2 : " + err);
                } else {
                    if(rows.length < 1){
                        express.request.user = {test:'name',age:21};
                    }
                }

                next();
            });
        })
    });*/

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
    /*app.get('/yolo1', function(req, res, next){
        req.session.email = {test:'name',age:21};
        res.json({ok:200});
    });*/

};

module.exports = server;