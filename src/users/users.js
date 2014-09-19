angular.module('core9Dashboard.users.config', [
  'ui.router',
  'ui.bootstrap',
  'core9Dashboard.config',
  'core9Dashboard.menu',
  'ngResource'
])

.factory('UserResource', function($resource) {
  return $resource('/admin/authentication/user/:userid',
          {userid: '@_id'},
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
  })
  .state('role',  {
    url: '/config/role/:id',
    views: {
      "main": {
        controller: 'RoleEditCtrl',
        templateUrl: 'users/role.tpl.html'
      }
    },
    resolve: {
      role: ['ConfigFactory', '$stateParams', function(ConfigFactory, $stateParams) {
        return ConfigFactory.get({configtype: 'userrole', id: $stateParams.id});
      }]
    },
    data:{ 
      pageTitle: 'Edit role',
      context: 'userscontext',
      sidebar: 'config'
    }
  });
})

.controller("UsersCtrl", function ($scope, $state, UserResource, ConfigFactory) {
  $scope.users = UserResource.query();
  $scope.roles = ConfigFactory.query({configtype: 'userrole'});

  $scope.add = function(username) {
    var user = new UserResource();
    user.username = username;
    user.roles = [];
    user.$save(function (data) {
      $scope.users.push(data);
      $scope.edit(data);
    });
  };

  $scope.addrole = function(rolename) {
    var role = new ConfigFactory();
    role.configtype = "userrole";
    role.name = rolename;
    role.permissions = [];
    role.$save(function (data) {
      $scope.roles.push(data);
      $scope.editrole(data);
    });
  };

  $scope.edit = function(user) {
    $state.go('user', {id: user._id});
  };

  $scope.editrole = function(role) {
    $state.go('role', {id: role._id});
  };

  $scope.remove = function (user, index) {
    user.$remove(function() {
      $scope.users.splice(index, 1);
    });
  };

  $scope.removerole = function (role, index) {
    role.$remove(function() {
      $scope.roles.splice(index, 1);
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

.controller("RoleEditCtrl", function ($scope, $state, role) {
  $scope.role = role;
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
        if(selected[i]['id'] === userid) {
            return true;
        }
    }
    return false;
  };

   $scope.select = function(user) {
    var deleted = false;
    for(var i = 0; i < selected.length; i++) {
        if(selected[i]['id'] === user['_id']) {
            deleted = true;
            selected.splice(i, 1);
        }
    }
    if(!deleted) {
        selected.push({id: user['_id'], entry: user});
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