/**
 * Created by thuylb on 02/03/2015.
 */
var express = require('express'),
    router = express.Router(),
    PaymentRepository = require('../repositories/payment');

var paymentRepo = new PaymentRepository();

router
    .get('/cardbt', paymentRepo.getCardByTime.bind(paymentRepo))
    .get('/smsbt', paymentRepo.getSmsByTime.bind(paymentRepo))
    .get('/bankbt', paymentRepo.getSmsByTime.bind(paymentRepo))
    .get('/withdrawbt', paymentRepo.getSmsByTime.bind(paymentRepo))
    .get('/banktransferbt', paymentRepo.getBankTransferByTime.bind(paymentRepo));
    //.get('/sms', statisticRepo.smsByTime.bind(statisticRepo))
    //.get('/bank', statisticRepo.bankByTime.bind(statisticRepo))
    //.get('/cpi', statisticRepo.cpiByTime.bind(statisticRepo))
    //.get('/withdraw', statisticRepo.withdrawByTime.bind(statisticRepo))
    //.get('/transfer', statisticRepo.tranferByTime.bind(statisticRepo))

module.exports = router;