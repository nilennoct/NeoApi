/**
 * Created by Neo on 13/7/14.
 */

var crypto = require('crypto');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var router = require('express').Router();

var settings = require('./settings');

var Project = require('./models/project');
var Api = require('./models/api');


router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
router.use(cookieParser()); // required before session.
router.use(session({ secret: settings.secret, name: 'sid'}));

/*router.use(function verifyLogin(req, res, next) {
  var path = req.url;
//    console.log(path);
  if (path != '/' && path != '/login' && path.indexOf('/reg/') != 0 && path.indexOf('/files/') != 0) {
    if ( ! req.session.user) {
      return res.send(403);
    }
  }
  next();
});*/

router.route('/').get(function(req, res) {
//    console.log(req.session.user);
  res.render('index', {user: req.session.user});
});

router.route('/login').post(function (req, res) {
  var md5 = crypto.createHash('md5');
  var username = req.param('username').toLowerCase();
//    console.log(req.param('username'));
  var password = md5.update(req.param('password')).digest('base64');

//    console.log(req.session.user);
  User.get(username, function(err, user) {
    if ( ! user || user.password != password) {
//            return res.status(403).json({info: 'Invalid access'});
      return res.send(403);
    }

    req.session.user = user;
//        console.log(req.session.user);
    res.json({uid: user._id});
  });
});

router.route('/logout').all(function (req, res) {
  req.session.destroy();
  res.json({status: true});
});

/**
 * route for projects
 */

router.route('/project')
  .get(function(req, res) {
    Project.all(function(err, projects) {
      if (err || ! projects) {
        return res.send(403);
      }

      res.json({
        status: 0,
        projects: projects
      });
    })
  })
  .post(function(req, res) {
    var project = new Project(req.body);

    project.insert(function(err, project) {
      if (err || project.length === 0) {
        return res.send(403);
      }

      res.json({
        status: 0,
        projectId: project[0]._id
      });
    });
  });

router.route('/project/:projectId')
  .get(function(req, res) {
    var projectId = req.param('projectId');

    Project.get(projectId, function(err, project) {
      if (err || ! project) {
        return res.send(404);
      }

      res.json({
        status: 0,
        project: project
      })
    })
  })
  .put(function(req, res) {
    var project = new Project(req.body);

    project.update(function(err, result) {
      if (err) {
        return res.send(403);
      }

      res.json({
        status: 0,
        result: result
      });
    });
  })
  .delete(function(req, res) {
    var project = new Project({
      _id: req.param('projectId')
    });

    project.remove(function(err, result) {
      if (err) {
        return res.send(403);
      }

      res.json({
        status: 0,
        result: result
      });
    });
  });

/**
 * route for apis
 */

router.route('/api/:projectId')
  .get(function(req, res) {
    var projectId = req.param('projectId');

    Api.all(projectId, function(err, apis) {
      if (err || ! apis) {
        return res.send(403);
      }

      res.json({
        status: 0,
        apis: apis
      });
    })
  })
  .post(function(req, res) {
    var api = new Api(req.body);

    api.insert(function(err, api) {
      if (err || api.length === 0) {
        return res.send(403);
      }

      res.json({
        status: 0,
        apiId: api[0]._id
      });
    });
  });

router.route('/api/:projectId/:apiId')
  .get(function(req, res) {
    var apiId = req.param('apiId');

    Api.get(apiId, function(err, api) {
      if (err || ! api) {
        return res.send(404);
      }

      res.json({
        status: 0,
        api: api
      })
    })
  })
  .put(function(req, res) {
    var api = new Api(req.body);

    api.update(function(err, result) {
      if (err) {
        return res.send(403);
      }

      res.json({
        status: 0,
        result: result
      });
    });
  })
  .delete(function(req, res) {
    var api = new Api({
      _id: req.param('apiId')
    });

    api.remove(function(err, result) {
      if (err) {
        return res.send(403);
      }

      res.json({
        status: 0,
        result: result
      });
    });
  });

module.exports = router;
