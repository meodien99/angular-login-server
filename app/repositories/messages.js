var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus'),
    session = require('express-session'),
    moment = require('moment-timezone'),
    timezone = require('../configs/moment_time_zone').timezone;
var image = require('easyimage');

var messenger = function(){
    "use strict";

    var self = this;

    function getMessageQuery(id, table){

        var query = "SELECT * FROM " + table + " ";
        if(id !== null){
            query += " WHERE id=\'" + id +"\'";
        }
        query += " ORDER BY created_date DESC";
        return query;
    }

    self.getMessages = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = getMessageQuery(null, "xgame_notification");
            //console.log(query);
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.getMessageDetail = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = getMessageQuery(req.params.id, "xgame_notification");
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.postCreateMessage = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var title = (req.body.title == null) ? null : req.body.title;
            var content = (req.body.content == null) ? null : req.body.content;
            var created_date = (req.body.created_date == null) ? new moment().tz(timezone).format().slice(0, 19).replace('T', ' ') : req.body.created_date;

            var is_active = 1;

            if(title == null || content == null || created_date == null || is_active == null )
                return F.responseJson(res, "Field not empty", {}, STATUS.BAD_REQUEST);

            var query = "INSERT INTO `xgame_notification` (`id`, `title`, `content`, `created_date`, `active`) VALUES (NULL, \'"+ title +"\', \'"+ content +"\', \'"+ created_date +"\', \'"+ is_active +"\')";

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.CREATED);
            });
        });
    };

    self.putUpdateMessage = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var title = (req.body.title == null) ? null : req.body.title;
            var content = (req.body.content == null) ? null : req.body.content;
            var is_active = (req.body.is_active == null) ? null : req.body.is_active;

            if(title == null || content == null )
                return F.responseJson(res, "Field not empty", {}, STATUS.BAD_REQUEST);

            var query = "UPDATE `xgame_notification` SET `title`=\'"+ title +"\', `content`=\'"+ content +"\', `active`=\'"+ is_active +"\' WHERE `id`=\'"+ req.params.id +"\'";


            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.deleteMessage = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var id = req.params.id;
            var query = "DELETE FROM `xgame_notification` WHERE `id`="+id;

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    /*========================================= XGAME_SYSTEM_MESSAGE =====================================================*/

    self.getAllXMessage = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = getMessageQuery(null, "xgame_system_message");
            //console.log(query);
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.getOneXMessage = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = getMessageQuery(req.params.id, "xgame_system_message");
            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };

    self.createXMessage = function(){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var title = (req.body.title == null) ? null : req.body.title;
            var content = (req.body.content == null) ? null : req.body.content;
            var type = (req.body.type == null) ? null : req.body.type;
            var created_date = new moment().tz(timezone).format().slice(0, 19).replace('T', ' ') ;

            var is_active = 1;

            if(title == null || content == null || type == null )
                return F.responseJson(res, "Field not empty", {}, STATUS.BAD_REQUEST);


            var file = req.files.file;
            if(file == null)
                return F.responseJson(res, "Image is required !", {}, STATUS.BAD_REQUEST);

            //console.log(1);
            var type = file.mimetype;
            if(type !== 'image/png' && type !== 'image/jpeg' && type !== 'image/gif' && type !== 'image/jpg'){
                return F.responseJson(res, "Icon must be image type !", {}, STATUS.BAD_REQUEST);
            }
            image.resize({
                src : file.path,
                dst : F.fnAppend(file.path,'thumb'),
                width : 100,
                height : 100
            }, function(err ,image, error){
                if(err)
                    return F.responseJson(res, err, {});
            });
            var icon = '/public/uploads/' + F.fnAppend(file.name, 'thumb');

            var query = "INSERT INTO `xgame_system_message` (`id`, `title`, `content`, `image`,`created_date`, `is_active`, `type`) VALUES (NULL, "+ connection.escape(title) +", "+ connection.escape(content)
                + ", " + icon + ", \'"+ created_date +"\', \'"+ is_active +"\'," + connection.escape(type) + ")";

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.CREATED);
            });
        });
    };

    self.updateXMessage = function(req, res, next){
        req.getConnection(function(err, connection){
            var title = (req.body.title == null) ? null : req.body.title;
            var content = (req.body.content == null) ? null : req.body.content;
            var type = (req.body.type == null) ? null : req.body.type;

            if(title == null || content == null || type == null )
                return F.responseJson(res, "Field not empty", {}, STATUS.BAD_REQUEST);

            var query = "UPDATE `xgame_system_message` SET `title`="+ connection.escape(title) +", `content`="+ connection.escape(content) +", `type`="+ connection.escape(type) ;

            var file = req.files.file;
            if(file){
                //console.log(1);
                var type = file.mimetype;
                if(type !== 'image/png' && type !== 'image/jpeg' && type !== 'image/gif' && type !== 'image/jpg'){
                    return F.responseJson(res, "Icon must be image type !", {}, STATUS.BAD_REQUEST);
                }
                image.resize({
                    src : file.path,
                    dst : F.fnAppend(file.path,'thumb'),
                    width : 100,
                    height : 100
                }, function(err ,image, error){
                    if(err)
                        return F.responseJson(res, err, {});
                });
                var icon = '/public/uploads/' + F.fnAppend(file.name, 'thumb');
                query += ", `image`=\'" + icon + "\' WHERE `id`=\'"+ req.params.id +"\'";
            } else {
                //console.log(2);

                query += " WHERE `id`=\'"+ req.params.id +"\'";
            }
        });
    };

    self.deleteXMessage = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});
            var id = req.params.id;
            var query = "DELETE FROM `xgame_system_message` WHERE `id`="+id;

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    }
};

module.exports = messenger;

