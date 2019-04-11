const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./logger');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const errors = require('@feathersjs/errors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb')
const service = require('feathers-mongodb');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const mongodb = require('./mongodb');

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

app.configure(mongodb);

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));

// Connect to mongodb
MongoClient.connect('mongodb://localhost:27017/nodeapp').then(function(db){
  // Connect to the db, create and register a Feathers service.
  app.use('/messages', service({
    Model: db.collection('messages'),
    paginate: {
      default: 2,
      max: 4
    }
  }));

  // A basic error handler, just like Express
  app.use(errors.handler());

  // Start the server
  const server = app.listen(3030);
  server.on('listening', function() {
    console.log('Feathers Message MongoDB service running on 127.0.0.1:3030');
  });
}).catch(function(error){
  console.error(error);
});

module.exports = app;
