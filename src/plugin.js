angular.module( 'core9Dashboard.users', [
  'core9Dashboard.users.config',
  'templates-module-platform-users'
  ])

;

angular.module('core9Dashboard.admin.dashboard').requires.push('core9Dashboard.users');