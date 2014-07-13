/**
 * Created by Neo on 22/5/14.
 */

var mongodb = require('./db');

function User(user) {
    this.username = user.username.trim();
    this.password = user.password;
}

module.exports = User;

User.prototype.save = function save(callback) {
    var user = {
        username: this.username,
        password: this.password
    };

    mongodb.users.ensureIndex('username', {unique: true}, function (err, indexName) {
        if (err) {
            return callback(err);
        }
        mongodb.users.insert(user, {safe: true}, function (err, user) {
            return callback(err, user);
        });
    });
};

User.get = function get(username, callback) {
    var usernameRegexp = new RegExp('^' + username + '$', 'i');
    mongodb.users.findOne({username: usernameRegexp}, function (err, doc) {
        if (doc) {
//            var user = new User(doc);
            callback(err, doc);
        }
        else {
            callback(err, null);
        }
    });
};
