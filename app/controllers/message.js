var express = require('express'),
    router = express.Router(),
    MessagesRepository = require('../repositories/messages');

var messageRepo = new MessagesRepository();

router
    .get('/messages', messageRepo.getMessages.bind(messageRepo))
    .get('/messages/:id', messageRepo.getMessageDetail.bind(messageRepo))
    .post('/messages', messageRepo.postCreateMessage.bind(messageRepo))
    .put('/messages/:id', messageRepo.putUpdateMessage.bind(messageRepo))
    .delete('/messages/:id', messageRepo.deleteMessage.bind(messageRepo))
;

module.exports = router;