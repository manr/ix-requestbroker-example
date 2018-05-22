import * as winston from 'winston'
import * as rotate from 'winston-daily-rotate-file'
import * as fs from 'fs';

const dir = './logs';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}


let logger = new winston.Logger({
    level: 'info',
    transports: [
        new (winston.transports.Console)({
            colorize: true,
        }),
        new winston.transports.DailyRotateFile({
            filename: 'broker.log',
            dirname: dir,
            maxsize: 20971520, //20MB
            maxFiles: 25,
            datePattern: 'YYYY-MM-DD'
        })
    ]
});

export default logger;