'use strict';

const youtubeDownloadService = require('../youtube');
const http = require('http');

module.exports.start = (config) => {
    return new Promise((resolve, reject) => {
        if (!config.port) {
            throw new Error('Please provide a port');
        }
        //server
        const server = http.createServer(youtubeDownloadService);
        server.on('clientError', (err, socket) => {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });
        server.on('connection', (socket) => {
            return resolve(socket);
        })
        server.listen(config.port);
    });
};
