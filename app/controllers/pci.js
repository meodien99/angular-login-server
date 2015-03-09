var express = require('express'),
    router = express.Router(),
    PCIRepository = require('../repositories/pci');

var pciRepo = new PCIRepository();


router
    //?platform=&user=&deviceID=
    .get('/api/apps/offers', pciRepo.getAppUserCanInstall.bind(pciRepo))
    //?offerID=&platform=&user=&deviceID=&transactionID=
    .get('/api/records/cpi', pciRepo.getSaveToRecord.bind(pciRepo))
    //crud
    .get('/pcis', pciRepo.getAllApps.bind(pciRepo))
    .get('/pcis/:id', pciRepo.getPCIAppDetail.bind(pciRepo))
    .post('/pcis', pciRepo.postCreateApps.bind(pciRepo))
    .put('/pcis/:id', pciRepo.putUpdateApp.bind(pciRepo))
    .delete('/pcis/:id', pciRepo.deleteApp.bind(pciRepo))
;

module.exports = router;