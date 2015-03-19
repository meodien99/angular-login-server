var API = require('./apiStatus'),
    jwt = require('jsonwebtoken'),
    moment = require('moment-timezone');


//return array by key given
var objectKeyFilter = function(needle, key){
    if(needle instanceof Array){
        var result = [];
        needle.forEach(function(item, index){
            if(item[key])
                result.push(item[key]);
        });
        return result;
    } else if(typeof needle == 'object') {
        if(needle[key])
            return needle[key];
    }
};

function arrayCompare(a1, a2){
    if(a1.length != a2.length)
        return false;
    var length = a2.length;
    for(var i = 0; i < length; i++){
        if(a1[i] != a2[i])
            return false;
    }
    return true;
}
var inArray = function(needle, haystack){
    var length = haystack.length;
    for(var i = 0; i < length; i++){
        if(typeof haystack[i] == 'object'){
            if(arrayCompare(haystack[i], needle))
                return true;
        } else {
            if(haystack[i] == needle)
                return true;
        }
    }
    return false;
};
var responseWithSuccess  = function(data, code){
    return {
        type : true,
        code : code,
        data : data
    }
};
var responseWithError = function(message, code){
    return {
        type : false,
        code : code,
        message : message
    }
};

module.exports = {
    responseJson : function(res, err, data, code){
        code = code || 500;

        //res.status(code);
        if(err || (code < 500 && code > 400)){
            return res.json(responseWithError(err,code));
        }

        return res.json(responseWithSuccess(data, code));
    },
    /**
     * Join 2 objects
     * @param haystack Array|Object
     * @param object object returned
     * @returns {*}
     */
    objectJoin : function(haystack, object){
        for(var key in haystack){
            var value = haystack[key];

            object[key] = value;
        }
        return object;
    },
    /**
     * Check if propertyValue represent to propertyKey is already exist
     * @param array
     * @param propertyValue
     * @param propertyKey
     * @return boolean
     */
    propertyValueIsExist : function(array, propertyKey, propertyValue){
        var array_name = objectKeyFilter(array, propertyKey);
        return inArray(propertyValue, array_name);
    },
    /**
     * Return position of property:searchTerm in array
     * @param array
     * @param searchTerm
     * @param property
     * @return number
     */
    arrayObjectIndexOf : function(array, searchTerm, property){
        for( var i = 0,len = array.length; i < len; i++){
            if(array[i][property] === searchTerm){
                return i;
            }
        }
        return -1;
    },
    getSchemaSuitableInput : function(propertyArray, schemasArray){
        var result = {};
        for(var property in propertyArray){
            var p = property;
            var v = propertyArray[p];
            if(inArray(p, schemasArray)){
                result[p] = v;
            }
        }
        console.log(result);
        return result;
    },
    objectIsEmpty : function(obj){
        for(var prop in obj){
            if(obj.hasOwnProperty(prop)){
                return false
            }
        }
        return true;
    },
    inArray: inArray,
    /**
     *
     * @param connect
     * @param req
     * @param action String
     */
    logger : function(connect, req, action){
        var ip = req.ip_address;
        var user = jwt.verify(req.token, process.env.JWT_SECRET).email;
        var time = moment().tz("Asia/Saigon").format().slice(0, 19).replace('T', ' ');

        //console.log(user)
        var query = "INSERT INTO `user_log`(`id`,`ip`,`username`,`action`,`time`) VALUES(NULL, " + connect.escape(ip) + " , " + connect.escape(user)
            + " , " + connect.escape(action) + " , " + connect.escape(time) + ")";

        //console.log(query);
        connect.query(query, function(err, rows){
            if(err)
                console.log(err);

            //console.log(rows);
        });
    }
};