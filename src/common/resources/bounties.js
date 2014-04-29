'use strict';

angular.module('resources').factory('Bounties', function ($rootScope, $resource) {

  // Define 'intercepting' functions that modify the API response for FE rendering
  function filterUniqueBackers (response) {
    var bounties = response.resource;
    //START enforce list of unique backers (prevent repeat backers)
    var unique_backer_bounties = {};
    for (var i=0; i<bounties.length; i++) {
      var bounty = bounties[i];
      if (bounty.owner) {
        var backer_id = bounty.owner.id + bounty.owner.type; // adding id+type prevents collision between multiple owner types
        if (unique_backer_bounties[backer_id]) { // backer already exists, add amounts
          var previous_bounty_amount = unique_backer_bounties[backer_id].amount;
          var bounty_amount = parseInt(bounty.amount, 10);
          var new_amount = previous_bounty_amount + bounty_amount;
          unique_backer_bounties[backer_id].amount = new_amount;
        } else {
          unique_backer_bounties[backer_id] = bounty;
          unique_backer_bounties[backer_id].amount = parseInt(bounty.amount, 10);
        }
      } else {
        unique_backer_bounties["anon_"+i] = bounty; //anonymous backer, add to list
        unique_backer_bounties["anon_"+i].amount = parseInt(bounty.amount, 10);
      }
    }
    //cast back into array
    var unique_backer_bounties_arr = [];
    for (var key in unique_backer_bounties) {
      unique_backer_bounties_arr.push(unique_backer_bounties[key]);
    }
    return unique_backer_bounties_arr;
  }

  return $resource($rootScope.api_host + '/bounties', null, {
    get: {
      method: 'GET',
      isArray: true,
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' },
      interceptor: {
        response: function (response) {
          return filterUniqueBackers(response);
        },

        responseError: function (rejection) {
          return rejection;
        }
      }
    }
  });

});
