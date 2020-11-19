/*
 * LICENSE: The MIT License (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://github.com/SiliconCraft/sic43nt-server-node/blob/master/LICENSE.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @copyright 2018 Silicon Craft Technology Co.,Ltd.
 * @license   https://github.com/SiliconCraft/sic43nt-server-node/blob/master/LICENSE.txt
 * @link      https://github.com/SiliconCraft/sic43nt-server-node
 *
 */

'use strict';

var express = require('express');
var router = express.Router();
var ks = require('../utils/keystream');

/* GET home page. */
router.get('/', function (req, res) {
    var rawData = "";

    var uid = "N/A";
    var defaultKey = "N/A";
    var flagTamperTag = "-";
    var timeStampTag = "-";
    var rollingCodeTag = "-";

    var flagTamperServer = "N/A";
    var timeStampServer = "N/A";
    var rollingCodeServer = "N/A";
    var rlc;

    var flagTamperDecision = "N/A";
    var timeStampTagDecision = "N/A";
    var rollingCodeDecision = "N/A";


    if (req.query !== null) {
        if (typeof req.query.d === 'string') {
            rawData = req.query.d.toUpperCase();
            uid = rawData.substring(0, 14);                     /* Extract UID */
            defaultKey = "FFFFFF" + uid;                        /* Use Default Key ("FFFFFF" + UID) */
            flagTamperTag = rawData.substring(14, 14 + 2);      /* Extract Tamper Flag */
            var tmp_timeStampTag = rawData.substring(16, 16 + 8);
            if (tmp_timeStampTag !== "") {                      /* Extract Time Stamp and Check the content*/
                timeStampTag = parseInt(tmp_timeStampTag, 16);

                /* Extract Rolling Code from Tag */
                rollingCodeTag = rawData.substring(24, 24 + 8);
                /* Calculate Rolling code from Server */
                rollingCodeServer = ks.keystream(ks.hexbit(defaultKey), ks.hexbit(tmp_timeStampTag), 4);
            }

            if (rollingCodeTag === rollingCodeServer) {
                rollingCodeDecision = "Correct";
            } else {
                if (flagTamperTag === "AA") {
                    /* for tags that can setting secure tamper */
                    rlc = ks.keystream(ks.hexbit(defaultKey), ks.hexbit(tmp_timeStampTag), 12);
                    rollingCodeServer = rlc.substring(16, 16 + 8);

                    if (rollingCodeTag === rollingCodeServer) {
                        rollingCodeDecision = "Correct";
                    } else {
                        rollingCodeDecision = "Incorrect";
                    }
                } else {
                    rollingCodeDecision = "Incorrect";
                }
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
        rollingCodeServer: rollingCodeServer,
        rollingCodeDecision: rollingCodeDecision
    });
});

module.exports = router;
