'use strict';

angular.module('app')
  .controller('TeamSuperFormController', function ($scope) {
    $scope.form_data = {};

    $scope.slugify = function(text) {
      return (text||"").toLowerCase().replace(/[ ]+/g,'-').replace(/[,.]/g,'').replace(/-(inc|llc)$/,'').replace(/[^a-z1-9-_]/g,'');
    };

    $scope.$watch('form_data.name', function() {
      $scope.form_data.slug = $scope.slugify($scope.form_data.name);
    });
  });
