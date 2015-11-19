angular.module('resources').factory('Bounties', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + 'bounties', null, {
    get: {
      method: 'GET',
      isArray: true,
      headers: $api.v2_headers()
    }
  });

});
