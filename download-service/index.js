const server = require('./server');
const config = require('./config');

// Log exceptions.
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
});

process.on('unhandledRejection', (err, promise) => {
  console.error('unhandledRejection', err);
});

server.start({
  port: config.port
}).then((app) => {
  console.log(`Downloading on port ${config.port}.`);
  app.on('close', () => {
    //TODO: cleanup
  });
});
