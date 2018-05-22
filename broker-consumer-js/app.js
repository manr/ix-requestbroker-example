// require the dependencies we installed
var redis = require('redis');

// create a new redis client and connect to our local redis instance
var pub = redis.createClient();
var sub = redis.createClient();

// if an error occurs, print it to the console
sub.on('error', function (err) {
    console.log("Error " + err);
});

pub.on('error', function (err) {
    console.log("Error " + err);
});

sub.on('message', (chan, msg) => {
    console.log("received on " + chan + ": " +  msg);
    if (chan == 'ix::request') {
        var payload = JSON.parse(msg);
        console.log("send response " + msg);
        pub.publish("ix::response", JSON.stringify({'id': payload.id, 'msg': payload.msg + " processed on " + new Date().toLocaleString()}));
    }
});

sub.subscribe('ix::request');
