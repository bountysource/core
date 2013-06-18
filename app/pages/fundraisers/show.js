'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraiserShowController'
      });
  })

  .controller('FundraiserShowController', function ($scope, $rootScope, $routeParams, $location, $api) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(r) {
      console.log(r);

      // authorization
      $scope.can_manage = r.person && $scope.current_person && r.person.id == $scope.current_person.id;

      // calculate percentage bar
      $scope.funding_percentage = Math.min(r.total_pledged / r.funding_goal, 100) * 100;

      // build fundraiser image out of CSS shit
      $scope.fundraiser_image_style = {
        'background-image': "url("+ r.image_url +")"
      };


      return r;
    });

    $scope.edit = function() { $location.path("/fundraisers/"+$routeParams.id+"/edit") };
  });
