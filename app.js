var express = require('express');
var app = express();

require('./app/setups/server')(app);
require('./app/setups/routers')(app);

module.exports = app;
