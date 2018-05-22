    // require the dependencies we installed
    import express from "express";
    import bodyParser from "body-parser";
    import responseTime from "response-time";
    import { createClient } from "redis";
    import hashmap from "hashmap";
    import uuid from "uuid/v1";
    import logger from './logger'
    import morgan from 'morgan'
    import cors from "cors";
 
    logger.stream = {
        write: function(message, encoding){
            logger.info(message);
        }
    };

    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(morgan("dev", { "stream": logger.stream }));

    // create a new redis client and connect to our local redis instance
    const pub = createClient();
    const sub = createClient();
    const req_map = new hashmap();

    // if an error occurs, print it to the console    
    sub.on('error', function (err) {
        console.log("Error " + err);
    });
    
    pub.on('error', function (err) {
        console.log("Error " + err);
    });

    sub.on('message', (chan, msg) => {
        console.log("received " + chan + " " + msg);
        if (chan == 'ix::response') {
            console.log("received response " + msg);
            var payload = JSON.parse(msg);
            var res = req_map.get(payload.id);
            if (!res)
            {
                console.error("Response time out.");
                return;
            }

            req_map.remove(payload.id);
            console.log('Map size ' + req_map.count());

            res.send(JSON.stringify({"channel": "ix::response", 
                                        "request_id": payload.id,
                                        "result": payload.msg }));
            res.end();
        }
    });

    sub.subscribe('ix::response');

    app.set('port', (process.env.PORT || 5000));

    // set up the response-time middleware
    app.use(responseTime());

    app.get('/api/send/:msg', function(req, res) {
        var msg = req.params.msg;
        var id = uuid();
        var msgToSend = JSON.stringify({'id':id, 'msg':msg});
        pub.publish('ix::request', msgToSend, function(result) {
            console.log('sent request to consumer...')
            req_map.set(id, res);
        });
    });

    app.listen(app.get('port'), function(){
        console.log('Server listening on port: ', app.get('port'));
    });

    setInterval(() => {
        console.log('Timeout responses. ' + req_map.count());
        
        req_map.forEach((v, k) => {
            if (!v.finished)
                v.status(500).end('Did not receive response from consumer.');
            req_map.remove(k)
        });
        
        console.log('Removed timeout responses. ' + req_map.count());
    }, 5000);