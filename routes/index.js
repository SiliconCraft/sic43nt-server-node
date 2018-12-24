'use strict';

var express = require('express');
var router = express.Router();
var ks = require('../utils/keystream');

/* GET home page. */
router.get('/', function (req, res) {
    var rawData = "";

    var uid = "";
    var defaultKey = "";
    var flagTamperTag = "";
    var timeStampTag = "";
    var rollingCodeTag = "";

    var flagTamperServer = "N/A";
    var timeStampServer = "N/A";
    var rollingCodeServer = "N/A";

    var flagTamperDecision = "N/A";
    var timeStampTagDecision = "N/A";
    var rollingCodeDecision = "N/A";


    if (req.query !== null) {
        if (typeof req.query.d === 'string') {
            rawData = req.query.d.toUpperCase();
            uid = rawData.substring(0, 14);
            defaultKey = "FFFFFF" + uid;
            flagTamperTag = rawData.substring(14, 14 + 2);
            var tmp_timeStampTag = rawData.substring(16, 16 + 8);
            if (tmp_timeStampTag !== "") {
                timeStampTag = parseInt(tmp_timeStampTag, 16).toString(16);
                rollingCodeTag = rawData.substring(24, 24 + 8);
                rollingCodeServer = ks.keystream(ks.hexbit(defaultKey), ks.hexbit(tmp_timeStampTag), 4);
            }

            if (rollingCodeTag === rollingCodeServer) {
                rollingCodeDecision = "Correct";
            } else {
                rollingCodeDecision = "Incorrect";
            }
        }
    }

    res.render('index', {
        title: 'SIC43NT Demonstration',
        uid: uid,
        defaultKey: defaultKey,
        flagTamperTag: flagTamperTag,
        flagTamperServer: flagTamperServer,
        flagTamperDecision: flagTamperDecision,
        timeStampTag: timeStampTag,
        timeStampServer: timeStampServer,
        timeStampDecision: timeStampTagDecision,
        rollingCodeTag: rollingCodeTag,
        rollingCodeServer : rollingCodeServer,
        rollingCodeDecision: rollingCodeDecision
    });
});

module.exports = router;
