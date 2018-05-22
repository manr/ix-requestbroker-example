"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _responseTime = require("response-time");

var _responseTime2 = _interopRequireDefault(_responseTime);

var _redis = require("redis");

var _hashmap = require("hashmap");

var _hashmap2 = _interopRequireDefault(_hashmap);

var _v = require("uuid/v1");

var _v2 = _interopRequireDefault(_v);

var _logger = require("./logger");

var _logger2 = _interopRequireDefault(_logger);

var _morgan = require("morgan");

var _morgan2 = _interopRequireDefault(_morgan);

var _cors = require("cors");

var _cors2 = _interopRequireDefault(_cors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_logger2.default.stream = {
    write: function write(message, encoding) {
        _logger2.default.info(message);
    }
}; // require the dependencies we installed


var app = (0, _express2.default)();
app.use((0, _cors2.default)());
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use((0, _morgan2.default)("dev", { "stream": _logger2.default.stream }));

// create a new redis client and connect to our local redis instance
var pub = (0, _redis.createClient)();
var sub = (0, _redis.createClient)();
var req_map = new _hashmap2.default();

// if an error occurs, print it to the console    
sub.on('error', function (err) {
    console.log("Error " + err);
});

pub.on('error', function (err) {
    console.log("Error " + err);
});

sub.on('message', function (chan, msg) {
    console.log("received " + chan + " " + msg);
    if (chan == 'ix::response') {
        console.log("received response " + msg);
        var payload = JSON.parse(msg);
        var res = req_map.get(payload.id);
        if (!res) {
            console.error("Response time out.");
            return;
        }

        req_map.remove(payload.id);
        console.log('Map size ' + req_map.count());

        res.send(JSON.stringify({ "channel": "ix::response",
            "request_id": payload.id,
            "result": payload.msg }));
        res.end();
    }
});

sub.subscribe('ix::response');

app.set('port', process.env.PORT || 5000);

// set up the response-time middleware
app.use((0, _responseTime2.default)());

app.get('/api/send/:msg', function (req, res) {
    var msg = req.params.msg;
    var id = (0, _v2.default)();
    var msgToSend = JSON.stringify({ 'id': id, 'msg': msg });
    pub.publish('ix::request', msgToSend, function (result) {
        console.log('sent request to consumer...');
        req_map.set(id, res);
    });
});

app.listen(app.get('port'), function () {
    console.log('Server listening on port: ', app.get('port'));
});

setInterval(function () {
    console.log('Timeout responses. ' + req_map.count());

    req_map.forEach(function (v, k) {
        if (!v.finished) v.status(500).end('Did not receive response from consumer.');
        req_map.remove(k);
    });

    console.log('Removed timeout responses. ' + req_map.count());
}, 5000);