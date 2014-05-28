'use strict;'

angular.module('factories').factory('EmailPreference', function ($rootScope, $resource, $api) {
  var defaultHeaders = { 'Accept': 'application/vnd.bountysource+json; version=2' };

  var EmailPreference = $resource($rootScope.api_host + 'email_preference', { access_token: $api.get_access_token() }, {
    update: {
      method: 'PUT',
      headers: defaultHeaders
    }
  });

  return EmailPreference;
});
