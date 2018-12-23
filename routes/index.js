'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Express',
        uid: "39493000000001",
        defaultKey : "FFFFFF39493000000001",
        flagTamperTag : "AA",
        flagTamperServer : "N/A",
        flagTamperDecision : "N/A",
        timeStampTag : "01234567",
        timeStampServer : "N/A",
        timeStampDecision : "N/A",
        rollingCodeTag : "76543210",
        rollingCodeServer : "87654321",
        rollingCodeDecision : "Incorrect"
    });
});

module.exports = router;
