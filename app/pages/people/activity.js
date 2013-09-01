'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/people/:id', {
        templateUrl: 'pages/people/activity.html',
        controller: 'PeopleShow'
      });
  })
  .controller('PeopleShow', function ($scope, $routeParams, $api, $pageTitle, $metaTags) {

    $scope.person = $api.person_get($routeParams.id);

    $scope.person.then(function(person){
      $pageTitle.set(person.display_name, 'Profile');
      $metaTags.add({
        'twitter:card':                'photo',
        'twitter:site':                '@bountysource',
        'twitter:creator':             '',
        'twitter:title':               person.display_name,
        'twitter:image:src':           person.large_image_url,
        'twitter:domain':              'bountysource.com',
        'twitter:app:name:iphone':     '',
        'twitter:app:name:ipad':       '',
        'twitter:app:name:googleplay': '',
        'twitter:app:url:iphone':      '',
        'twitter:app:url:ipad':        '',
        'twitter:app:url:googleplay':  '',
        'twitter:app:id:iphone':       '',
        'twitter:app:id:ipad':         '',
        'twitter:app:id:googleplay':   ''
      });
    });

    $scope.timeline = $api.person_timeline_get($routeParams.id).then(function(response) {
      return response;
    });

  });

