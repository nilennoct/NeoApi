/**
 * Created by Neo on 13/7/14.
 */

var ObjectID = require('mongodb').ObjectID;
var mongodb = require('./db');

var Api = function Api(api) {
  this._id = api._id || null;
  this.name = api.name;
  this.url = api.url;
  this.method = api.method;
  this.reqParams = api.reqParams;
  this.resParams = api.resParams;
  this.projectId = api.projectId;
};

module.exports = Api;

Api.prototype.insert = function insert(callback) {
  var api = {
    name: this.name,
    url: this.url,
    method: this.method,
    reqParams: this.reqParams,
    resParams: this.resParams,
    projectId: this.projectId
  };

  mongodb.api.ensureIndex('name', {unique: true}, function (err, indexName) {
    if (err) {
      return callback(err);
    }
    mongodb.api.insert(api, {safe: true}, function (err, api) {
      return callback(err, api);
    });
  });
};

Api.prototype.update = function update(callback) {
  var _id = ObjectID.createFromHexString(this._id);
  var api = {
    name: this.name,
    url: this.url,
    method: this.method,
    reqParams: this.reqParams,
    resParams: this.resParams
  };

  mongodb.api.update({_id: _id}, {$set: api}, function (err, result) {
    callback(err, result);
  });
};

Api.prototype.remove = function remove(callback) {
  var _id = ObjectID.createFromHexString(this._id);

  mongodb.api.remove({_id: _id}, function (err, result) {
    callback(err, result);
  });
};

Api.get = function get(id, callback) {
  var _id = ObjectID.createFromHexString(id);
  mongodb.api.findOne({_id: _id}, function (err, doc) {
    callback(err, doc ? new Api(doc) : null);
  });
};

Api.find = function find(projectId, query, callback) {
  query.projectId = projectId;
  mongodb.api.find(query).sort({url: 1}).toArray(function (err, docs) {
    callback(err, docs ? docs : null);
  });
};

Api.all = function all(projectId, callback) {
  Api.find(projectId, {}, callback);
};
