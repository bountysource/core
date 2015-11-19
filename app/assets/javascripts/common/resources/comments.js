angular.module('resources').factory('Comments', function ($rootScope, $resource, $api) {

  return $resource($rootScope.api_host + '/comments', null, {
    index: {
      method: 'GET',
      isArray: true,
      headers: $api.v2_headers()
    }
  });

});
