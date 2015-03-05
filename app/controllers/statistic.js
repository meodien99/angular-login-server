var express = require('express'),
    router = express.Router(),
    StatisticRepository = require('../repositories/statistic');

var statisticRepo = new StatisticRepository();

router
    .get('/nubr', statisticRepo.newUserByRanger.bind(statisticRepo))
    .get('/nubt', statisticRepo.newUserByTime.bind(statisticRepo))
    .get('/upbr', statisticRepo.playedUserByRange.bind(statisticRepo))
    .get('/upbt', statisticRepo.playedUserByTime.bind(statisticRepo))
    .get('/activeUserbt', statisticRepo.activeUserByTime.bind(statisticRepo))
    .get('/gbt', statisticRepo.totalGamePlayedByTime.bind(statisticRepo))
    .get('/gbr', statisticRepo.totalGamePlayedByRange.bind(statisticRepo))
    .get('/gtbt', statisticRepo.getTaskByTime.bind(statisticRepo));

module.exports = router;