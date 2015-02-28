var F = require('../helpers/functions'),
    STATUS = require('../helpers/apiStatus'),
    session = require('express-session');
var messenger = function(){
    "use strict";

    var self = this;

    function getMessageQuery(id){
        var query = "SELECT * FROM xgame_system_message ";
        if(id !== null){
            query += " WHERE id=\'" + id +"\'";
        }
        query += " ORDER BY created_date DESC";
        return query;
    };

    self.getMessages = function(req, res, next){
        req.getConnection(function(err, connection){
            if(err)
                return F.responseJson(res, err, {});

            var query = getMessageQuery(null);
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

            var query = getMessageQuery(req.params.id);
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
            var created_date = (req.body.created_date == null) ? new Date().toISOString().slice(0, 19).replace('T', ' ') : req.body.created_date;
            var type = (req.body.type == null) ? null : req.body.type;

            var is_active = 1;

            if(title == null || content == null || created_date == null || is_active == null || type == null )
                return F.responseJson(res, "Field not empty", {}, STATUS.BAD_REQUEST);

            var query = "INSERT INTO `xgame_system_message` (`id`, `title`, `image`, `content`, `created_date`, `is_active`, `type`) VALUES (NULL, \'"+ title +"\', NULL, \'"+ content +"\', \'"+ created_date +"\', b\'"+ is_active +"\', \'"+ type +"\')";

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
            var type = (req.body.type == null) ? null : req.body.type;

            if(title == null || content == null || type == null )
                return F.responseJson(res, "Field not empty", {}, STATUS.BAD_REQUEST);

            var query = "UPDATE `xgame_system_message` SET `title`=\'"+ title +"\', `content`=\'"+ content +"\', `is_active`=b\'"+ is_active +"\', `type`=\'"+ type +"\' WHERE `id`=\'"+ req.params.id +"\'";


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
            var query = "DELETE FROM `xgame_system_message` WHERE `id`="+id;

            connection.query(query, function(err, rows){
                if(err)
                    return F.responseJson(res, err, {});

                return F.responseJson(res, null, rows, STATUS.OK);
            });
        });
    };
};

module.exports = messenger;

