'use strict';

angular.module('app').controller('FundraiserNavTabsController', function ($scope, $location, $api) {
  $scope.active_tab = function(name) {
    if (name === 'overview' && (/^\/fundraisers\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
    if (name === 'updates' && (/^\/fundraisers\/[a-z-_0-9]+\/updates$/i).test($location.path())) { return "active"; }
    if (name === 'pledges' && (/^\/fundraisers\/[a-z-_0-9]+\/pledges$/i).test($location.path())) { return "active"; }
    if (name === 'rewards' && (/^\/fundraisers\/[a-z-_0-9]+\/rewards$/i).test($location.path())) { return "active"; }
    if (name === 'pledge_now' && (/^\/fundraisers\/[a-z-_0-9]+\/pledge$/i).test($location.path())) { return "active"; }
    if (name === 'receipts' && (/^\/fundraisers\/[a-z-_0-9]+\/receipts$/i).test($location.path())) { return "active"; }
    if (name === 'receipts' && (/^\/fundraisers\/[a-z-_0-9]+\/receipts\/recent$/i).test($location.path())) { return "active"; }
  };

  $scope.receipts = [];
  $scope.fundraiser.then(function (fundraiser) {
    $api.pledge_activity().then(function (response) {
      for (var i=0; response && i<response.length; i++) {  //grab all of the users pledges, if any of them have the same ID as this fundraiser, then push to the receipts array
        if (response[i].fundraiser.id === fundraiser.id) {
          $scope.receipts.push(response[i]);
        }
      }
    });
  });
});
