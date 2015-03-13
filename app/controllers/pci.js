var express = require('express'),
    router = express.Router(),
    PCIRepository = require('../repositories/pci');

var pciRepo = new PCIRepository();

function ensureAuthorized (req, res, next){
    var bearerToken ;
    var bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined'){
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        //console.log(bearerToken);
        req.ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(401);
    }
}

router
    //?platform=&user=&deviceID=&type=
    .get('/api/apps/offers', pciRepo.getAppUserCanInstall.bind(pciRepo))
    //
    .get('/api/records/cpi', pciRepo.getSaveToRecord.bind(pciRepo))
    //crud
    .get('/pcis', ensureAuthorized, pciRepo.getAllApps.bind(pciRepo))
    .get('/pcis/:id', ensureAuthorized, pciRepo.getPCIAppDetail.bind(pciRepo))
    .post('/pcis', ensureAuthorized, pciRepo.postCreateApps.bind(pciRepo))
    .put('/pcis/:id', ensureAuthorized, pciRepo.putUpdateApp.bind(pciRepo))
    .delete('/pcis/:id', ensureAuthorized, pciRepo.deleteApp.bind(pciRepo))
;

module.exports = router;