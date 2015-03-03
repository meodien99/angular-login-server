var express = require('express'),
    router = express.Router(),
    PCIRepository = require('../repositories/pci');

var pciRepo = new PCIRepository();

router
    .get('/apps/offers', pciRepo.getOffers.bind(pciRepo))
;

module.exports = router;