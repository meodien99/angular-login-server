/**
 * Created by thuylb on 02/03/2015.
 */
var express = require('express'),
    router = express.Router(),
    EventRepository = require('../repositories/event');

var eventRepo = new EventRepository();

router
    .get('/getEvents', eventRepo.getEvents.bind(eventRepo))
    .post('/createEvent', eventRepo.createEvent.bind(eventRepo))
    .put('/updateEvent', eventRepo.updateEvent.bind(eventRepo))
;
module.exports = router;