'use strict';

angular.module('activity').controller('PledgesController', function($scope, $routeParams, $api, $pageTitle) {
  $pageTitle.set('Pledges', 'Activity');

  $api.call("/user/pledges").then(function(pledges) {
    for (var i=0; i<pledges.length; i++) {
      // Get the zero reward and put it on fundraisers
      for (var j=0; j<pledges[i].fundraiser.rewards.length; j++) {
        if (pledges[i].fundraiser.rewards[j].amount === 0) {
          pledges[i].fundraiser.zero_reward = pledges[i].fundraiser.rewards[j];
          break;
        }
      }

      // Initialize reward_id for each pledge, as well as whether or not to show the reward
      // info/survey response form by default (meaning the reward requires a survey and the pledge
      // doesn't have one yet)
      if (pledges[i].reward) {
        pledges[i].reward_id = pledges[i].reward.id;

        // If the pledge is missing survey data, show by default
        if (pledges[i].reward.fulfillment_details && !pledges[i].survey_response) {
          pledges[i].$show_survey = true;
        }
      }
    }

    $scope.pledges = pledges;

    return pledges;
  });

  $scope.toggle_anonymous = function(pledge) {
    $api.pledge_anonymity_toggle(pledge).then(function() {
      pledge.anonymous = !pledge.anonymous;
    });
  };

  $scope.select_reward = function(pledge, reward) {
    pledge.reward = reward;
  };

  $scope.update_pledge = function(pledge) {
    var payload = {
      reward_id: pledge.reward_id,
      survey_response: pledge.survey_response
    };

    $api.pledge_update(pledge.id, payload).then(function(updated_pledge) {
      // $scope.$init_pledge(updated_pledge);
      pledge.$show_survey = false;
      pledge.$updated_at = new Date();
    });
  };

  // filter pledges for those which require a survey response
  $scope.requires_action = function(pledge) {
    return pledge.reward && pledge.reward.fulfillment_details && !pledge.survey_response;
  };

  $scope.$init_pledge = function(pledge) {
    pledge.$show_survey = $scope.requires_action(pledge);
    if (pledge.$show_survey) { pledge.survey_response = pledge.survey_response || ""; }
  };
});
