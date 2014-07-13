#!/bin/env node
/**
 * Created by Neo on 13/7/14.
 */

var express = require('express');

var settings = require('./settings');
var router = require('./router');
var mongodb = require('./models/db');

/**
 *  Define the sample application.
 */
var NeoAPI = function () {

  //  Scope.
  var self = this;


  /*  ================================================================  */
  /*  Helper functions.                                                 */
  /*  ================================================================  */

  /**
   *  Set up server IP address and port # using env variables/defaults.
   */
  self.setupVariables = function () {
    //  Set the environment variables we need.
    self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
    self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

    if (typeof self.ipaddress === "undefined") {
      //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
      //  allows us to run/test the app locally.
      console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
      self.ipaddress = "127.0.0.1";
    }
  };


  /**
   *  terminator === the termination handler
   *  Terminate server on receipt of the specified signal.
   *  @param {string} sig  Signal to terminate on.
   */
  self.terminator = function (sig) {
    if (typeof sig === "string") {
      console.log('%s: Received %s - terminating sample app ...',
        new Date(Date.now()), sig);
      process.exit(1);
    }

    mongodb.db.close();

    console.log('%s: Node server stopped.', new Date(Date.now()));
  };


  /**
   *  Setup termination handlers (for exit and a list of signals).
   */
  self.setupTerminationHandlers = function () {
    //  Process on exit and signals.
    process.on('exit', function () {
      self.terminator();
    });

    // Removed 'SIGPIPE' from the list - bugz 852598.
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
      'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function (element, index, array) {
        process.on(element, function () {
          self.terminator(element);
        });
      });
  };


  /*  ================================================================  */
  /*  App server functions (main app logic here).                       */
  /*  ================================================================  */


  /**
   *  Initialize the server (express) and create the routes and register
   *  the handlers.
   */
  self.initializeServer = function () {
    self.app = new express();

//    self.app.set('views', __dirname + '/views');
    self.app.set('view engine', 'ejs');
    self.app.use('/public', express.static(__dirname + '/public'));

    // simple logger
    self.app.use(function (req, res, next) {
      console.log('%s %s', req.method, req.url);
      next();
    });

//        self.app.use(bodyParser());
    self.app.use(router);
  };


  /**
   *  Initializes the sample application.
   */
  self.initialize = function () {
    self.setupVariables();
//        self.populateCache();
    self.setupTerminationHandlers();

    // Create the express server and routes.
    self.initializeServer();
  };


  /**
   *  Start the server (starts up the sample application).
   */
  self.start = function () {
    //  Start the app on the specific interface (and port).
    self.app.listen(self.port, self.ipaddress, function () {
      console.log('%s: Node server started on %s:%d ...',
        new Date(Date.now()), self.ipaddress, self.port);
    });
  };

};
/*  Sample Application.  */


/**
 *  main():  Main code.
 */
var app = new NeoAPI();
app.initialize();
app.start();
