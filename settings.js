/**
 * Created by Neo on 13/7/14.
 */

var settings = {
  // secure
  secret: "^IXAR3hqI-7U1~a+w@vUj6zcN=!WT3nY",
  // database
  db: "neoapi",
  mongodbURL: process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://127.0.0.1/',
  // data store
  dataDir: process.env.OPENSHIFT_DATA_DIR || __dirname
};

module.exports = settings;