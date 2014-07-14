/**
 * Created by Neo on 13/7/14.
 */

var ObjectID = require('mongodb').ObjectID;
var mongodb = require('./db');

var Project = function Project(project) {
  this._id = project._id || null;
  this.name = project.name;
  this.description = project.description;
};

module.exports = Project;

Project.prototype.insert = function insert(callback) {
  var project = {
    name: this.name,
    description: this.description
  };

  mongodb.project.ensureIndex('name', {unique: true}, function (err, indexName) {
    if (err) {
      return callback(err);
    }
    mongodb.project.insert(project, {safe: true}, function (err, project) {
      return callback(err, project);
    });
  });
};

Project.prototype.update = function update(callback) {
  var _id = ObjectID.createFromHexString(this._id);
  var project = {
    name: this.name,
    description: this.description
  };

  mongodb.project.update({_id: _id}, {$set: project}, function (err, result) {
    callback(err, result);
  });
};

Project.prototype.remove = function remove(callback) {
  var _id = ObjectID.createFromHexString(this._id);

  mongodb.project.remove({_id: _id}, function (err, result) {
    callback(err, result);
  });
};

Project.get = function get(id, callback) {
  var _id = ObjectID.createFromHexString(id);
  mongodb.project.findOne({_id: _id}, function (err, doc) {
    callback(err, doc ? new Project(doc) : null);
  });
};

Project.find = function find(query, callback) {
  mongodb.project.find(query).toArray(function (err, docs) {
    callback(err, docs ? docs : null);
  })
};

Project.all = function all(callback) {
  Project.find({}, callback);
};

