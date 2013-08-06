'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/pledges', {
        templateUrl: 'pages/activity/pledges.html',
        controller: 'PledgeActivity',
        resolve: $person,
        title: 'Bountysource - Pledges'
      });
  })
  .controller('PledgeActivity', function($scope, $routeParams, $api) {
    $scope.pledges = $api.call("/user/pledges").then(function(pledges) {
      for (var i=0; i<pledges.length; i++) { $scope.$init_pledge(pledges[i]); }
      return pledges;
    });

    $scope.toggle_anonymous = function(pledge) {
      $api.pledge_anonymity_toggle(pledge).then(function() {
        pledge.anonymous = !pledge.anonymous;
      });
    };

    // filter pledges for those which require a survey response
    $scope.requires_action = function(pledge) {
      return pledge.reward && pledge.reward.fulfillment_details && !pledge.survey_response;
    };

    $scope.submit_survey = function(pledge) {
      $api.pledge_update(pledge.id, { survey_response: pledge.survey_response }).then(function(updated_pledge) {
        $scope.$init_pledge(pledge);
        for (var k in pledge) { pledge[k] = updated_pledge[k]; }
      });
    };

    $scope.$init_pledge = function(pledge) {
      pledge.$show_survey = $scope.requires_action(pledge);
      if (pledge.$show_survey) { pledge.survey_response = pledge.survey_response || ""; }
    };
  });

