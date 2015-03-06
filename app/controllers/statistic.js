var express = require('express'),
    router = express.Router(),
    StatisticRepository = require('../repositories/statistic');

var statisticRepo = new StatisticRepository();

router
    .get('/activeUserbt', statisticRepo.activeUserByTime.bind(statisticRepo))
    .get('/newUserbt', statisticRepo.newUserByTime.bind(statisticRepo))
    .get('/gbt', statisticRepo.totalGamePlayedByTime.bind(statisticRepo))
    .get('/gbr', statisticRepo.totalGamePlayedByRange.bind(statisticRepo))
    .get('/gtbt', statisticRepo.getTaskByTime.bind(statisticRepo))
    .get('/gcbt', statisticRepo.getCCUByTime.bind(statisticRepo));
module.exports = router;