var CMD = function(app){

    var yargs = require('yargs').boolean('r').boolean('a').argv,
        fs = require('fs'),
        mysql = require('mysql'),
        connection = require('express-myconnection'),
        dbConfig = require('../configs/database'),
        path = require('path'),
        moment = require('moment-timezone'),
        timezone = require('../configs/moment_time_zone').timezone;

    // --db=XXX
    var __dbConfig = null;
    if(yargs.db && dbConfig[yargs.db]){
        __dbConfig = yargs.db
    } else {
        __dbConfig = "local";
    }

    var mysql_mysql = dbConfig[__dbConfig].mysql;

    //setup mysql driven
    app.use(
        connection(mysql, mysql_mysql,'request')
    );
    console.log("Using DB " + mysql_mysql.database + " running on server " + __dbConfig);


    /*============================== init update ==================================*/
    //alter
    if(yargs.a){
        //walking directory
        var dir_path = path.join(__dirname, '../migrates');
        fs.readdir(dir_path, function(err, files){
            if(err){
                fs.mkdirSync(dir_path);
            } else {
                mysql_mysql.multipleStatements = true;
                var con = mysql.createConnection(mysql_mysql);
                con.connect();

                files.forEach(function (file, index) {
                    if(file.indexOf('migrate') === -1)
                        return;

                    //check if DB recorded this file
                    var query_select = "SELECT * FROM `migrations` WHERE `migrate`=" + con.escape(file);
                    con.query(query_select, function(err, rows){
                        if(err){
                            console.log(err);
                            return;
                        }
                        //file does not save !
                        if(rows.length < 1){
                            //save to db
                            var save_query = "INSERT INTO `migrations`(`migrate`) VALUES(" + con.escape(file) + ")";

                            con.query(save_query, function(err, done){
                                if(err){
                                    console.log(err);
                                    return;
                                }
                                //read content from file
                                var query_content = fs.readFileSync(dir_path + "/" + file, "utf8");

                                con.query(query_content, function(err, rows){
                                    if(err){
                                        console.log(err);
                                        return;
                                    }
                                    console.log("DONE !");
                                });
                            });
                        } else {
                            console.log("Everything is up-to-date !")
                        }
                    });
                });
                //con.end();
            }
        });
    }

    /*============================== init release ==================================*/
    // release
    if(yargs.r){
        var filename = 'migrate_' +moment.tz(timezone).format().slice(0,19).replace('T','_').replace(/:/g,'_').replace(/-/g,'_')  + '.mi';
        var filepath = path.join(__dirname, '../migrates/' + filename);
        fs.writeFile(filepath,'',function(err){
            if(err)
                console.log(err);
            console.log(filename + " has created !");
        });
    }
};

module.exports = CMD;