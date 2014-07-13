/**
 * Created by Neo on 13/7/14.
 */

var neoAPI = angular.module('NeoAPI', ['neoAPIService', 'neoAPIController', 'neoAPIRouter']);

var neoAPIService = angular.module('neoAPIService', []);
var neoAPIController = angular.module('neoAPIController', []);
var neoAPIRouter = angular.module('neoAPIRouter', ['ngRoute']);

neoAPIRouter.config(['$routeProvider', function($routeProvider) {
  var tplUrl = '/public/partial/';
  $routeProvider.
    when('/project', {
      templateUrl: tplUrl + 'project.html',
      controller: ProjectCtrl
    }).
    when('/project/:projectId', {
      templateUrl: tplUrl + 'api.html',
      controller: ApiCtrl
    }).
    when('/', {
      templateUrl: tplUrl + 'index.html'
    }).
    otherwise({
      redirectTo: '/'
    })
}]);

neoAPIService.factory('Project', ['$http', function($http) {
  var url = '/project/';
  return {
    query: function(callback) {
      $http.get(url).success(function(json) {
        callback(json);
      });
    }
  }
}]);

neoAPIService.factory('Api', ['$http', function($http) {
  var url = '/api/';
  return {
    query: function(projectId, callback) {
      $http.get(url + projectId).success(function(json) {
        callback(json);
      });
    },
    put: function(api, callback) {
      $http.put(url + api._id, api).success(function(json) {
        callback(json);
      });
    },
    post: function(projectId, api, callback) {
      $http.post(url + projectId, api).success(function(json) {
        callback(json);
      });
    }
  }
}]);

neoAPIController.controller('ProjectCtrl', ['$scope', 'Project', ProjectCtrl]);
neoAPIController.controller('ApiCtrl', ['$scope', '$routeParams', 'Api', ApiCtrl]);

function ProjectCtrl($scope, Project) {
  Project.query(function(data) {
    $scope.projects = data.projects;
  });
}

function ApiCtrl($scope, $routeParams, Api) {
  $scope.selected = {
    api: null,
    index: -1
  };

  $scope.methodTypes = ['GET', 'POST', 'PUT', 'DELETE'];
  $scope.paramTypes = ['', 'int', 'string', 'object', 'arrayInt', 'arrayString', 'arrayObject'];

  $scope.projectId = $routeParams.projectId;

  Api.query($scope.projectId, function(data) {
    $scope.apis = data.apis;
  });

  $scope.select = function select($index) {
    if (typeof $index !== 'undefined' && $index >= 0) {
      $scope.selected.api = angular.copy($scope.apis[$index]);
      $scope.selected.index = $index;
      angular.element('#apiList').find('.active').removeClass('active');
      angular.element('#apiList').find(':eq(' + ($index + 1) + ')').addClass('active');
    }
    else {
      $scope.selected.api = null;
      $scope.selected.index = -1;
      angular.element('#apiList').find('.active').removeClass('active');
    }
  };

  $scope.reset = function reset() {
    $scope.selected.api = angular.copy($scope.apis[$scope.selected.index]);
  };

  $scope.create = function create() {
    $scope.select();
    angular.element('#apiList').find(':eq(0)').addClass('active');
    $scope.selected.api = {
      name: '',
      url: '',
      method: 'GET',
      reqParams: [],
      resParams: [],
      projectId: $scope.projectId
    };
    $scope.selected.index = null;
  };

  $scope.canCreateSubParam = function canCreateSubParam(type) {
    return type === 'object' || type === 'arrayObject';
  };

  $scope.createParam = function createParam(param) {
    if (angular.isArray(param)) {
      param.push({
        name: '',
        type: '',
        note: ''
      });
    }
    else {
      if ( ! $scope.canCreateSubParam(param.type)) {
        return;
      }

      param.params = param.params || [];
      param.params.push({
        name: '',
        type: '',
        note: ''
      });
    }
  };

  $scope.removeParam = function removeParam($index, param) {
    param.splice($index, 1);
  };

  $scope.save = function save() {
    if (typeof $scope.selected.api._id !== 'undefined') {
      Api.put($scope.selected.api, function(data) {
        angular.extend($scope.apis[$scope.selected.index], $scope.selected.api);
      });
    }
    else {
      Api.post($scope.projectId, $scope.selected.api, function(data) {
        $scope.selected.api._id = data.apiId;
        $scope.apis.push($scope.selected.api);
        $scope.selected.index = $scope.apis.length - 1;
        angular.element('#apiList').find(':eq(' + $scope.apis.length + ')').addClass('active');
      })
    }
  }
}
