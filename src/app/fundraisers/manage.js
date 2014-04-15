'use strict';

angular.module('fundraisers').controller("FundraiserManageController", function ($analytics, $scope, $location) {
  $scope.fundraiserCreateRedirect = function (team) {
    // mixpanel track event
    $analytics.startFundraiserDraft(team.id, { type: "big_button"});
    $location.path("teams/"+team.slug+"/fundraisers/new");
  };
});
