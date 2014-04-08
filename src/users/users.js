angular.module('core9Dashboard.users.config', [
  'ui.router',
  'ui.bootstrap',
  'ngResource'
])

.factory('UserResource', function($resource) {
  return $resource('/admin/authentication/user/:userid',
          {userid: '@id'},
          {update: {method: 'PUT' }});
})

.config(function ($stateProvider) {
  $stateProvider
  .state('users',  {
    url: '/config/users',
    views: {
      "main": {
        controller: 'UsersCtrl',
        templateUrl: 'users/users.tpl.html'
      }
    },
    data:{ 
      pageTitle: 'Users',
      context: 'userscontext',
      sidebar: 'config'
    }
  })
  .state('user',  {
    url: '/config/user/:id',
    views: {
      "main": {
        controller: 'UsersEditCtrl',
        templateUrl: 'users/edit.tpl.html'
      }
    },
    data:{ 
      pageTitle: 'Edit user',
      context: 'userscontext',
      sidebar: 'config'
    },
    resolve: {
      user: ["UserResource", "$stateParams", function(UserResource, $stateParams) {
        return UserResource.get({userid: $stateParams.id});
      }]
    }
  });
})

.controller("UsersCtrl", function ($scope, $state, UserResource) {
  $scope.users = UserResource.query();

  $scope.add = function(username) {
    var user = new UserResource();
    user.username = username;
    user.roles = [];
    user.$save(function (data) {
      $scope.users.push(data);
      $scope.edit(data);
    });
  };

  $scope.edit = function(user) {
    $state.go('user', {id: user.id});
  };

  $scope.remove = function (user, index) {
    user.$remove(function() {
      $scope.users.splice(index, 1);
    });
  };
})

.controller("UsersEditCtrl", function ($scope, $state, user) {
  $scope.user = user;
  $scope.newPassword = "";

  $scope.save = function () {
    if($scope.newPassword !== "") {
      $scope.user.newPassword = $scope.newPassword;
    }
    $scope.user.$update();
    $state.go('users');
  };
})

.controller("FeatureProcessorUserCtrl", function ($scope, $modal) {

  $scope.deselect = function(index) {
    $scope.$parent.selected.splice(index, 1);
  };

  $scope.add = function () {
    var modalInstance = $modal.open({
      templateUrl: 'users/processor.modal.tpl.html',
      controller: 'FeatureProcessorUserModalCtrl',
      resolve: {
        selected: function() {
            return $scope.$parent.selected;
        }
      }
    });
  };
})

.controller('FeatureProcessorUserModalCtrl', function($scope, $modalInstance, UserResource, selected) {
  $scope.users = UserResource.query();

  $scope.isSelected = function(userid) {
    for(var i = 0; i < selected.length; i++) {
        if(selected[i].id === userid) {
            return true;
        }
    }
    return false;
  };

   $scope.select = function(user) {
    var deleted = false;
    for(var i = 0; i < selected.length; i++) {
        if(selected[i].id === user.id) {
            deleted = true;
            selected.splice(i, 1);
        }
    }
    if(!deleted) {
        selected.push({id: user.id, entry: user});
    }
  };

  $scope.ok = function() {
    $modalInstance.close();
  };
})

.run(function(MenuService) {
  MenuService.add('config', {title: "Users", weight: 200, link: "users"});
})
;