'use strict';
module.exports = {
    local : {
        mysql : {
            host : 'localhost',
            port : 3306,
            user : 'root',
            password : 'root',
            database : 'xgame'
        }
    },
    xgamedb : {
        mysql : {
            host: '123.30.189.189',
            port: 7462,
            user: 'root',
            password: 'mysqlanlon.com.vn',
            database: 'xgamedb'
        }
    },
    playa : {
        mysql : {
            host : 'xgamedb.cxtcwijogw46.us-west-2.rds.amazonaws.com',
            port : 3306,
            user : 'root',
            password : 'mysqlplaya',
            database : 'xgamedb'
        }
    }
    /*'mysql' : {
     host: '123.30.189.189',
     port: 7462,
     user: 'admintool',
     password: 'admintool@2211',
     database: 'xgamedb'
     }*/
};