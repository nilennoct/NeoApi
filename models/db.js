/**
 * Created by Neo on 22/5/14.
 */

var settings = require('../settings');
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(settings.mongodbURL + settings.db, function (err, db) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  exports.db = db;
  exports.user = db.collection('users');
  exports.project = db.collection('projects');
  exports.api = db.collection('apis');
});
